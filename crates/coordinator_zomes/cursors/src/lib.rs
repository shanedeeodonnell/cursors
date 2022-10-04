mod cursor;
pub use cursor::*;
use hdk::prelude::*;

// Remote call input
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CursorPayload {
    pub x: f32,
    pub y: f32
}

[#hdk_extern]
pub fun init(_:()) -> ExternResult<InitCallbackresult> {
  let mut functions = GrantedFunctions::new();
  functions.insert((ZomeName::new("cursors"), FunctionName::new("update_cursor")));
  let grant = ZomeCallCapGrant {
      access: CapAccess::Unrestricted,
      functions,
      tag: "".into(),
  };
  create_cap_grant(grant.into())?;
  Ok(InitCallbackResult::Pass)
}

#[hdk_extern]
pub fn ui_updated(message: String) -> ExternResult<()> {
  // get vec of all profiles
  let response: ZomeCallResponse = call(
      CallTargetCell::Local,
      ZomeName::new("profiles"), 
      FunctionName::new("get_all_profiles"), 
      None, 
      ()
  )?;

  let records: Vec<Record> =  match response {
    ZomeCallResponse::Ok(content)=> Ok(content),
    _ => Err(wasm_error!(WasmErrorInner::Guest("Network, Unauthorized, or Countersigning error".into())))
  }?.decode::<Vec<Record>>().unwrap();

  let mut all_agent_pub_keys: Vec<AgentPubKey> = Vec::new();
  for record in records {
    all_agent_pub_keys.push(record.signed_action.action().author().to_owned());
  }

  // Send a signal to all other agents
  let this_agent_pub_key: AgentPubKey = agent_info()?.agent_initial_pubkey;
  let other_agent_pub_keys: Vec<AgentPubKey> = all_agent_pub_keys.into_iter().filter(|x| *x != this_agent_pub_key).collect();

  for other in other_agent_pub_keys {
    let payload = SignalPayload {
        message: message.clone()
    };
    // debug!("Called agent {:?}", other.clone());

    call_remote(
        other,
        ZomeName::new("cursors"),
        FunctionName::new("update_cursor"),
        None,
        payload.clone()
    )?;
    // debug!("Called remote_update_for_ui with payload {:?}", payload);
  }

  Ok(())
}

#[hdk_extern]
pub fn update_cursor(payload: SignalPayload)  -> ExternResult<()> {
    emit_signal(payload.clone())?;
    Ok(())
}