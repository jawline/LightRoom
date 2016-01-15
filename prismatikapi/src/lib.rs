use std::io::prelude::*;
use std::net::TcpStream;

pub struct Prismatik {
	stream: TcpStream
}

impl Prismatik {
	pub fn new(path: &str, key: &str) -> Prismatik {
		Prismatik {
			stream: TcpStream::connect(path).unwrap()
		}
	}
}