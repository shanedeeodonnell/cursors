use hdi::prelude::*;





#[hdk_entry_helper]
#[derive(Clone)]
pub struct Cursor {
  pub title: String,
  pub content: String,
}