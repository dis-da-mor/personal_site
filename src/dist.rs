use std::path::{Path, PathBuf};

use rocket::{
    fs::{relative, NamedFile},
    get,
    http::Status,
};
use rocket_governor::RocketGovernor;

use crate::RateLimit;

#[get("/<path..>", rank = 10)]
pub(crate) async fn files(
    _rate_limit: RocketGovernor<'_, RateLimit>,
    mut path: PathBuf,
) -> Result<NamedFile, Status> {
    if path.is_dir() || path.components().next().is_none() || path.extension().is_none() {
        path.push("index.html");
    }
    NamedFile::open(Path::new(relative!("astro/dist")).join(path))
        .await
        .map_err(|_| Status::new(404))
}
