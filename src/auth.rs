use dotenv::dotenv;
use rocket::{
    fairing::{Fairing, Info, Kind},
    form::Form,
    http::{Cookie, CookieJar},
    post,
    response::Redirect,
    uri, Data, FromForm, Request, State,
};
use rocket_governor::{Method, Quota, RocketGovernable, RocketGovernor};
use std::{env, fs, num::NonZero, path::Path, sync::LazyLock};

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
fn validate_cookie(cookie: Option<Cookie>) -> bool {
    cookie.is_some_and(|cookie| cookie.value() == ADMIN_COOKIE.value())
}
const ADMIN_KEY: &'static str = "admin";
const ADMIN_VALUE: &'static str = "true";
const ADMIN_COOKIE: LazyLock<Cookie> = LazyLock::new(|| {
    let mut cookie = Cookie::new(ADMIN_KEY, ADMIN_VALUE);
    cookie.set_secure(true);
    cookie
});
#[derive(FromForm)]
pub(crate) struct AdminForm {
    password: String,
}
#[post("/admin_submit", data = "<form>")]
pub(crate) fn admin_submit(
    form: Form<AdminForm>,
    password_state: &State<AuthState>,
    cookies: &CookieJar<'_>,
    _limitguard: RocketGovernor<RateLimitGuard>,
) -> Redirect {
    if validate_cookie(cookies.get_private(ADMIN_KEY)) {
        return Redirect::to("/admin_login?status=already");
    }
    if form.password.as_str() == password_state.0 {
        cookies.add_private(ADMIN_COOKIE.clone());
        let written = cookies.get_pending(&ADMIN_KEY).unwrap();
        let value = written.value();
        fs::write(Path::new("./astro/auth"), value).unwrap();
        return Redirect::to(uri!("/admin_login?status=ok"));
    }
    Redirect::to(uri!("/admin_login?status=err"))
}
