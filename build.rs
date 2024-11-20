use std::process::{Command, Stdio};

fn main() {
    println!("cargo:rerun-if-changed=public/typescript");
    let out = Command::new("./transpile.sh")
        .stderr(Stdio::inherit())
        .status()
        .unwrap();
    if !out.success() {
        panic!("failed build")
    }
}
