
import { DnaSource, Record, ActionHash } from "@holochain/client";
import { pause, runScenario } from "@holochain/tryorama";
import { decode } from '@msgpack/msgpack';
import pkg from 'tape-promise/tape';
const { test } = pkg;

import { cursorsDna } from  "../../utils";


export default () => test("cursor CRUD tests", async (t) => {
  await runScenario(async scenario => {

    const dnas: DnaSource[] = [{path: cursorsDna }];

    const [alice, bob]  = await scenario.addPlayersWithHapps([dnas, dnas]);

    await scenario.shareAllAgents();

    const createInput = {
  "title": "my You're trips",
  "content": "I travel for work, but recently, friends said I should take major trips. You really think you can fly that thing? If any movie people are watching this show, please, for me, have some respect."
};

    // Alice creates a cursor
    const createActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "create_cursor",
      payload: createInput,
    });
    t.ok(createActionHash);

    // Wait for the created entry to be propagated to the other node.
    await pause(100);

    
    // Bob gets the created cursor
    const createReadOutput: Record = await bob.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "get_cursor",
      payload: createActionHash,
    });
    t.deepEqual(createInput, decode((createReadOutput.entry as any).Present.entry) as any);
    
    
    // Alice updates the cursor
    const contentUpdate = {
  "title": "comes please enough",
  "content": "AM/FM radio, reclining bucket seats, and power windows. AM/FM radio, reclining bucket seats, and power windows. It is beets."
}

    const updateInput = {
      original_action_hash: createActionHash,
      updated_cursor: contentUpdate,
    };

    const updateActionHash: ActionHash = await alice.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "update_cursor",
      payload: updateInput,
    });
    t.ok(updateActionHash); 

    // Wait for the updated entry to be propagated to the other node.
    await pause(100);

      
    // Bob gets the updated cursor
    const readUpdatedOutput: Record = await bob.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "get_cursor",
      payload: updateActionHash,
    });
    t.deepEqual(contentUpdate, decode((readUpdatedOutput.entry as any).Present.entry) as any); 

    
    
    // Alice deletes the cursor
    const deleteActionHash = await alice.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "delete_cursor",
      payload: createActionHash,
    });
    t.ok(deleteActionHash); 

      
    // Wait for the deletion action to be propagated to the other node.
    await pause(100);

    // Bob tries to get the deleted cursor, but he doesn't get it because it has been deleted
    const readDeletedOutput = await bob.cells[0].callZome({
      zome_name: "cursors",
      fn_name: "get_cursor",
      payload: createActionHash,
    });
    t.notOk(readDeletedOutput);

    
  });



});
