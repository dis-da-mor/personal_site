use anyhow::anyhow;
use dotenv::dotenv;
use rocket::{
    async_trait,
    fairing::{Fairing, Info, Kind},
    form::Form,
    get,
    http::{Cookie, CookieJar, Status},
    post,
    request::{FromRequest, Outcome},
    response::Redirect,
    serde::{json::Json, Serialize},
    uri, Data, FromForm, Request, State,
};
use rocket_governor::{LimitError, Method, Quota, RocketGovernable, RocketGovernor};
use std::{env, num::NonZero, sync::LazyLock};

pub struct RateLimitGuard;
impl<'r> RocketGovernable<'r> for RateLimitGuard {
    fn quota(_method: Method, _route_name: &str) -> Quota {
        Quota::per_hour(NonZero::new(10).unwrap())
    }
}
pub(crate) struct Auth;
pub(crate) struct AuthState(String);
pub(crate) fn auth_state() -> AuthState {
    dotenv().unwrap();
    AuthState(env::var(ADMIN_KEY).unwrap())
}
#[rocket::async_trait]
impl Fairing for Auth {
    fn info(&self) -> Info {
        Info {
            name: "authentication",
            kind: Kind::Request,
        }
    }
    async fn on_request(&self, request: &mut Request<'_>, _: &mut Data<'_>) {
        if request.cookies().get(ADMIN_KEY).is_some()
            && !validate_cookie(request.cookies().get_private(ADMIN_KEY))
        {
            request.cookies().remove(ADMIN_KEY);
        }
    }
}
pub(crate) fn validate_cookie(cookie: Option<Cookie>) -> bool {
    cookie.is_some_and(|cookie| cookie.value() == ADMIN_COOKIE.value())
}
pub(crate) const ADMIN_KEY: &'static str = "admin";
const ADMIN_VALUE: &'static str = "true";
const ADMIN_COOKIE: LazyLock<Cookie> = LazyLock::new(|| {
    let mut cookie = Cookie::new(ADMIN_KEY, ADMIN_VALUE);
    cookie.set_secure(true);
    cookie.set_expires(None);
    cookie
});
#[derive(FromForm)]
pub(crate) struct AdminForm {
    password: String,
}
#[get("/login")]
pub(crate) fn login_already(_admin_guard: AdminGuard) -> Redirect {
    Redirect::to(uri!("/private/admin"))
}
#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub(crate) struct LogoutReturn {
    message: String,
    good: bool,
}
#[get("/logout")]
pub(crate) fn logout(cookies: &CookieJar<'_>) -> Json<LogoutReturn> {
    let out = if validate_cookie(cookies.get_private(ADMIN_KEY)) {
        cookies.remove_private(ADMIN_KEY);
        LogoutReturn {
            message: "logged out".to_string(),
            good: true,
        }
    } else {
        LogoutReturn {
            message: "not logged in".to_string(),
            good: false,
        }
    };
    Json(out)
}
#[post("/login", data = "<form>")]
pub(crate) fn login(
    form: Form<AdminForm>,
    password_state: &State<AuthState>,
    cookies: &CookieJar<'_>,
    _limitguard: GuessLimit,
) -> Redirect {
    if validate_cookie(cookies.get_private(ADMIN_KEY)) {
        return Redirect::to(uri!("/private/admin"));
    }
    if form.password.as_str() != password_state.0 {
        return Redirect::to(uri!("/admin_add?status=err"));
    }
    cookies.add_private(ADMIN_COOKIE.clone());
    Redirect::to(uri!("/private/admin"))
}
pub(crate) struct GuessLimit;

#[async_trait]
impl<'r> FromRequest<'r> for GuessLimit {
    type Error = LimitError;
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        if validate_cookie(request.cookies().get_private(ADMIN_KEY)) {
            return Outcome::Success(GuessLimit);
        }
        request
            .guard::<RocketGovernor<RateLimitGuard>>()
            .await
            .map(|_| Self)
    }
}

pub(crate) struct AdminGuard;
#[async_trait]
impl<'r> FromRequest<'r> for AdminGuard {
    type Error = anyhow::Error;
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        if validate_cookie(request.cookies().get_private(ADMIN_KEY)) {
            Outcome::Success(Self)
        } else {
            Outcome::Error((Status::new(403), anyhow!("not admin")))
        }
    }
}
pub(crate) struct UnAdminGuard;
#[async_trait]
impl<'r> FromRequest<'r> for UnAdminGuard {
    type Error = anyhow::Error;
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        if !validate_cookie(request.cookies().get_private(ADMIN_KEY)) {
            Outcome::Success(Self)
        } else {
            Outcome::Error((Status::new(403), anyhow!("not admin")))
        }
    }
}
