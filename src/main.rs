use dist::files;
use rocket::{
    catch, catchers,
    figment::{Figment, Profile},
    http::Status,
    launch, routes, Request,
};
use rocket_governor::{Method, Quota, RocketGovernable};
use stat::{stat_generate, stat_state};
use std::num::NonZeroU32;
mod dist;
mod stat;

#[launch]
fn rocket() -> _ {
    let stat_state = stat_state();
    rocket::custom(figment_gen())
        .mount("/", routes![files, stat_generate])
        .manage(stat_state)
        .register("/", catchers![not_found, too_many, default_catch])
}

fn figment_gen() -> Figment {
    Figment::from(rocket::Config::default()).select(Profile::from_env_or("APP_PROFILE", "default"))
}
pub(crate) struct RateLimit;
impl<'r> RocketGovernable<'r> for RateLimit {
    fn quota(_method: Method, _route_name: &str) -> Quota {
        Quota::per_second(NonZeroU32::new(5).unwrap())
    }
}
#[catch(404)]
fn not_found(req: &Request) -> String {
    format!("error 404 for {}: not found", req.uri())
}

#[catch(429)]
fn too_many(req: &Request) -> String {
    format!("error 429 for {}: too many requests", req.uri())
}

#[catch(default)]
fn default_catch(status: Status, req: &Request) -> String {
    format!(
        "error {} for {}: {}",
        status.code,
        req.uri(),
        status.reason().unwrap_or("unknown reason")
    )
}
