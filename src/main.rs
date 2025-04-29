use private::files;
use rocket::{
    figment::{Figment, Profile},
    launch, routes,
};
use stat::{stat_generate, stat_state};
mod auth;
mod private;
mod stat;

#[launch]
fn rocket() -> _ {
    let stat_state = stat_state();
    rocket::custom(figment_gen())
        .mount("/", routes![files])
        .manage(stat_state)
        .mount("/", routes![stat_generate])
}

fn figment_gen() -> Figment {
    Figment::from(rocket::Config::default()).select(Profile::from_env_or("APP_PROFILE", "default"))
}
