use rocket::{fs::FileServer, launch, routes};
use stat::{stat_generate, stat_state, stats};
use user_agent_parser::UserAgentParser;
mod stat;

#[launch]
fn rocket() -> _ {
    let stat_state = stat_state();
    rocket::build()
        .manage(UserAgentParser::from_str(include_str!("regexes.yaml")).unwrap())
        .mount("/", FileServer::from("./astro/dist"))
        .mount("/", routes![stats, stat_generate])
        .manage(stat_state)
}
