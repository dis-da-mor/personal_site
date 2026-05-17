use std::path::{Path, PathBuf};

use rocket::{
    fs::{relative, NamedFile},
    futures::TryFutureExt,
    get,
    http::Status,
};

#[get("/<path..>", rank = 10)]
pub(crate) async fn files(mut path: PathBuf) -> Result<NamedFile, Status> {
    if path.is_dir() || path.components().next().is_none() || path.extension().is_none() {
        path.push("index.html");
    }
    if path.to_string_lossy().contains("social_tech_a2") {
        let comps = path.components().collect::<Vec<_>>();
        let end = comps.last().ok_or(Status::new(404))?;
        return NamedFile::open(Path::new(relative!("social_tech_a2")).join(end))
            .map_err(|_| Status::new(404))
            .await;
    }
    NamedFile::open(Path::new(relative!("astro/dist")).join(path))
        .await
        .map_err(|_| Status::new(404))
}
