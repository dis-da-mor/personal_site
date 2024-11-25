use std::{
    env,
    process::{Command, Stdio},
    sync::Arc,
};

use pyo3::{ffi::c_str, types::PyModule};
use rocket::{
    fs::FileServer,
    http::Status,
    request::{FromRequest, Outcome},
    response::content::RawHtml,
    Request,
};
#[macro_use]
extern crate rocket;
use user_agent_parser::{Device, UserAgentParser};
mod encode;

struct Stat(String);
const SPACE_REPLACER: char = '-';
const SHIFT: u32 = 10;
const START_POINT: u32 = 'a' as u32;

#[async_trait]
impl<'r> FromRequest<'r> for Stat {
    type Error = ();
    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let Some(param) = request.uri().query().and_then(|query| {
            query
                .segments()
                .find(|segment| segment.0 == "id")
                .map(|segment| segment.1)
        }) else {
            return Outcome::Error((Status::BadRequest, ()));
        };
        match decode(param) {
            Ok(x) => Outcome::Success(x),
            Err(x) => Outcome::Error((Status::BadRequest, x)),
        }
    }
}

fn decode(param: &str) -> Result<Stat, ()> {
    let stat = param
        .split(',')
        .into_iter()
        .enumerate()
        .map(|(index, word)| {
            if index == 0 {
                word.parse::<f32>().map_err(|_| ())?;
                return Ok(word.to_string());
            }
            word.chars()
                .map(|current_char| match current_char {
                    SPACE_REPLACER => Ok(' '),
                    char if !char.is_ascii_lowercase() => Err(()),
                    char => {
                        let digit = char as u32 - START_POINT;
                        Ok(char::from_u32(
                            START_POINT + (digit).checked_sub(SHIFT).unwrap_or(26 - SHIFT + digit),
                        )
                        .unwrap())
                    }
                })
                .collect::<Result<String, ()>>()
        })
        .map(|word| word.map(|value| format!("\"{}\"", value)))
        .collect::<Result<Vec<String>, ()>>()?
        .join(",");
    Ok(Stat(format!("[{}]", stat)))
}

#[get("/Stats")]
fn stats(
    stat: Result<Stat, ()>,
    _user_agent: user_agent_parser::UserAgent,
    device: Device,
) -> RawHtml<String> {
    let stats_file = include_str!("../public/stats.html");
    let stats_file = stats_file
        .replace(
            "\"{getWords}\"",
            &stat
                .map(|stat| stat.0)
                .unwrap_or_else(|_| "undefined".into()),
        )
        .replace(
            "\"{isMobile}\"",
            if device.name == Some("Mobile".into()) {
                "true"
            } else {
                "false"
            },
        );
    RawHtml(stats_file)
}
use pyo3::prelude::*;
#[launch]
fn rocket() -> _ {
    Python::with_gil(|py| {
        let trial = PyModule::from_code(
            py,
            c_str!(include_str!("../model/main.py")),
            c_str!("main.py"),
            c_str!("main"),
        )
        .unwrap();
    });
    rocket::build()
        .manage(UserAgentParser::from_str(include_str!("regexes.yaml")).unwrap())
        .mount("/", FileServer::from("./astro/dist"))
        .mount("/", routes![stats])
}
