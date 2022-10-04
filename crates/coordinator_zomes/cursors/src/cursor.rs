use hdk::prelude::*;
use cursors_integrity::Cursor;
use cursors_integrity::EntryTypes;

#[hdk_extern]
pub fn get_cursor(action_hash: ActionHash) -> ExternResult<Option<Record>> {
  get(action_hash, GetOptions::default())
}


#[hdk_extern]
pub fn create_cursor(cursor: Cursor) -> ExternResult<ActionHash> {
  create_entry(&EntryTypes::Cursor(cursor.clone()))
}


#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateCursorInput {
  original_action_hash: ActionHash,
  updated_cursor: Cursor
}

#[hdk_extern]
pub fn update_cursor(input: UpdateCursorInput) -> ExternResult<ActionHash> {
  update_entry(input.original_action_hash, &input.updated_cursor)
}


#[hdk_extern]
pub fn delete_cursor(action_hash: ActionHash) -> ExternResult<ActionHash> {
  delete_entry(action_hash)
}

