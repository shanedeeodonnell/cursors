
import { LitElement, html } from 'lit';
import { state, customElement, property } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, Record, ActionHash, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { decode } from '@msgpack/msgpack';
import { appInfoContext, appWebsocketContext } from '../../../contexts';
import { Cursor } from '../../../types/cursors/cursors';
import '@material/mwc-circular-progress';
import '@type-craft/title/title-detail';
import '@type-craft/content/content-detail';

@customElement('cursor-detail')
export class CursorDetail extends LitElement {
  @property()
  actionHash!: ActionHash;

  @state()
  _cursor: Cursor | undefined;

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async firstUpdated() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'cursors')!;

    const record: Record | undefined = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'cursors',
      fn_name: 'get_cursor',
      payload: this.actionHash,
      provenance: cellData.cell_id[1]
    });

    if (record) {
      this._cursor = decode((record.entry as any).Present.entry) as Cursor;
    }
  }

  render() {
    if (!this._cursor) {
      return html`<div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    }

    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Cursor</span>

        
    <title-detail
    
    .value=${this._cursor.title}
      style="margin-top: 16px"
    ></title-detail>

        
    <content-detail
    
    .value=${this._cursor.content}
      style="margin-top: 16px"
    ></content-detail>

      </div>
    `;
  }
}
