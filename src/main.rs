use auth::{admin_submit, auth_state, Auth};
use rocket::{catchers, fs::FileServer, launch, routes};
use rocket_governor::rocket_governor_catcher;
use stat::{stat_generate, stat_state, stats};
use user_agent_parser::UserAgentParser;
mod auth;
mod stat;

#[launch]
fn rocket() -> _ {
    let stat_state = stat_state();
    let auth_state = auth_state();
    rocket::build()
        .manage(UserAgentParser::from_str(include_str!("regexes.yaml")).unwrap())
        .mount("/", FileServer::from("./astro/dist"))
        .mount("/", routes![stats, stat_generate])
        .attach(Auth)
        .mount("/", routes![admin_submit])
        .manage(stat_state)
        .manage(auth_state)
        .register("/", catchers![rocket_governor_catcher])
}
