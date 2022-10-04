use hdi::prelude::*;

mod cursor;
pub use cursor::Cursor;


#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
#[entry_def()]
Cursor(Cursor),

}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
  Ok(ValidateCallbackResult::Valid)
}
