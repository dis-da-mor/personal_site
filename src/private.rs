use std::path::{Path, PathBuf};

use rocket::{
    fs::{relative, NamedFile},
    get,
    http::{CookieJar, Status},
};

#[get("/<path..>", rank = 10)]
pub(crate) async fn files(mut path: PathBuf, cookies: &CookieJar<'_>) -> Result<NamedFile, Status> {
    /*
    let has_private = path
        .components()
        .map(|component| component == Component::Normal(OsStr::new("private")))
        .next()
        .is_some();
    let is_admin = validate_cookie(cookies.get_private(&ADMIN_KEY));
    let has_back = path
        .components()
        .any(|component| matches!(component, Component::ParentDir));
    if (!is_admin && has_private) || has_back {
        return Err(Status::new(403));
    }
    */
    if path.is_dir() || path.components().next().is_none() || path.extension().is_none() {
        path.push("index.html");
    }
    dbg!(&path);
    NamedFile::open(Path::new(relative!("astro/dist")).join(path))
        .await
        .map_err(|_| Status::new(404))
}
