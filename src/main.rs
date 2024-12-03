use auth::{auth_state, login, login_already, logout, Auth};
use private::files;
use rocket::{
    catchers,
    figment::{Figment, Profile},
    launch, routes,
};
use rocket_governor::rocket_governor_catcher;
use stat::{stat_generate, stat_state};
use std::{fs, path::Path};
mod auth;
mod private;
mod stat;

#[launch]
fn rocket() -> _ {
    let stat_state = stat_state();
    let auth_state = auth_state();
    rocket::custom(figment_gen())
        .register("/", catchers![rocket_governor_catcher])
        .mount("/", routes![files])
        .manage(stat_state)
        .mount("/", routes![stat_generate])
        .attach(Auth)
        .manage(auth_state)
        .mount("/", routes![login, login_already, logout])
}

fn figment_gen() -> Figment {
    let key_path = Path::new(".key");
    let mut key = [0u8; 64];
    if !key_path.exists() {
        getrandom::getrandom(&mut key).unwrap();
        fs::write(key_path, key).unwrap();
    } else {
        key = fs::read(key_path).unwrap().try_into().unwrap();
    }
    Figment::from(rocket::Config::default())
        .merge(("secret_key", key.to_vec()))
        .select(Profile::from_env_or("APP_PROFILE", "default"))
}
