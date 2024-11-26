sudo apt install -y musl-tools
rustup target add x86_64-unknown-linux-musl

cargo build --target x86_64-unknown-linux-musl --release
ldd ./target/x86_64-unknown-linux-musl/release/personal_site
