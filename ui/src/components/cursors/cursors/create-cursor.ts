
import { LitElement, html } from 'lit';
import { state, customElement } from 'lit/decorators.js';
import { InstalledCell, AppWebsocket, InstalledAppInfo } from '@holochain/client';
import { contextProvided } from '@lit-labs/context';
import { appWebsocketContext, appInfoContext } from '../../../contexts';
import { Cursor } from '../../../types/cursors/cursors';
import '@material/mwc-button';
import '@type-craft/title/create-title';
import '@type-craft/content/create-content';

@customElement('create-cursor')
export class CreateCursor extends LitElement {

    @state()
  _title: string | undefined;

  @state()
  _content: string | undefined;

  isCursorValid() {
    return this._title && 
      this._content;
  }

  @contextProvided({ context: appWebsocketContext })
  appWebsocket!: AppWebsocket;

  @contextProvided({ context: appInfoContext })
  appInfo!: InstalledAppInfo;

  async createCursor() {
    const cellData = this.appInfo.cell_data.find((c: InstalledCell) => c.role_id === 'cursors')!;

    const cursor: Cursor = {
      title: this._title!,
        content: this._content!,
    };

    const actionHash = await this.appWebsocket.callZome({
      cap_secret: null,
      cell_id: cellData.cell_id,
      zome_name: 'cursors',
      fn_name: 'create_cursor',
      payload: cursor,
      provenance: cellData.cell_id[1]
    });

    this.dispatchEvent(new CustomEvent('cursor-created', {
      composed: true,
      bubbles: true,
      detail: {
        actionHash
      }
    }));
  }

  render() {
    return html`
      <div style="display: flex; flex-direction: column">
        <span style="font-size: 18px">Create Cursor</span>

        <create-title 
      
      @change=${(e: Event) => this._title = (e.target as any).value}
      style="margin-top: 16px"
    ></create-title>

        <create-content 
      
      @change=${(e: Event) => this._content = (e.target as any).value}
      style="margin-top: 16px"
    ></create-content>

        <mwc-button 
          label="Create Cursor"
          .disabled=${!this.isCursorValid()}
          @click=${() => this.createCursor()}
        ></mwc-button>
    </div>`;
  }
}
