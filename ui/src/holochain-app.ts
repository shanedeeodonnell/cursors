import { LitElement, css, html } from 'lit';
import '@material/mwc-circular-progress';
import './components/cursors/cursors/create-cursor';
import './components/cursors/cursors/cursor-detail';
import { CursorBox } from './cursorBox';
import { customElement, property, state } from 'lit/decorators.js';
import { ProfilePrompt } from '@holochain-open-dev/profiles';
import { ProfilesStore, ProfilesService, profilesStoreContext } from "@holochain-open-dev/profiles";
import { contextProvided } from '@lit-labs/context';

import { AppWebsocket } from '@holochain/client'
import { ContextProvider } from '@lit-labs/context';
import { HolochainClient, CellClient } from '@holochain-open-dev/cell-client';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';

@customElement('holochain-app')
export class HolochainApp extends ScopedElementsMixin(LitElement) {

  @property({ type: Object })
  @contextProvided({context: profilesStoreContext})
  store!: ProfilesStore;

  @state() loaded = false;

  async firstUpdated() {
    const appWs = await AppWebsocket.connect(`ws://localhost:${process.env.HC_PORT}`);

    const client = new HolochainClient(appWs);

    const appInfo = await appWs.appInfo({
      installed_app_id: 'cursors'
    })
    const cell = appInfo.cell_data.find(c => c.role_id === 'cursors');
    console.log(appInfo, cell)

    const cellClient = new CellClient(client, cell!);

    const profilesStore = new ProfilesStore(new ProfilesService(cellClient));
    new ContextProvider(this, profilesStoreContext, profilesStore);

    this.loaded = true;
    console.log("ProfilesStore pubkey: ", profilesStore.myAgentPubKey);

  }

  render() {
    if (!this.loaded) return html`<span>Loading...</span>`;

    return html`
      <profile-prompt>
        <cursor-box>
          <h1 style="background: lightblue;">This is an H1 that is using CursorBox</h1>
        </cursor-box>
      </profile-prompt>
    `;
  }

  static get scopedElements() {
    return {
      'cursor-box': CursorBox,
      'profile-prompt': ProfilePrompt
    };
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--lit-element-background-color);
    }

    main {
      flex-grow: 1;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }
  `;
}