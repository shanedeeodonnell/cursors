import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import {
  AppWebsocket,
  ActionHash,
  InstalledAppInfo,
  AppSignalCb,
  AppSignal,
} from '@holochain/client';
import { contextProvider } from '@lit-labs/context';
import '@material/mwc-circular-progress';
import './components/cursors/cursors/create-cursor';
import './components/cursors/cursors/cursor-detail';
import { appWebsocketContext, appInfoContext } from './contexts';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { HolochainClient } from "@holochain-open-dev/cell-client";
import { CircularProgress } from '@material/mwc-circular-progress';

@customElement("cursor-box")
export class CursorBox extends ScopedElementsMixin(LitElement) {
  @state() loading = true;
  @state() wait = false;
  @property({type: Number})
  timesPerSecond = 5;

  @contextProvider({ context: appWebsocketContext })
  @property({ type: Object })
  appWebsocket!: AppWebsocket;

  @contextProvider({ context: appInfoContext })
  @property({ type: Object })
  appInfo!: InstalledAppInfo;

  @property({ type: Object })
  client!: HolochainClient;


  @query("#canvas")
  cursorBox!: HTMLElement;

  private signalCb: AppSignalCb = async (signal: AppSignal) => {
    const message = signal.data.payload.message;
    console.log(JSON.parse(message));
  };

  private onMouseMove = async (event: MouseEvent) => {
    const boundingBox = this.cursorBox.getBoundingClientRect();
    const x = event.clientX - boundingBox.left;
    const y = event.clientY - boundingBox.top;

    const payload = [x, y];
    if (!this.wait) {
      console.log('x: ', x / (boundingBox.right - boundingBox.left));
      console.log('y: ', y / (boundingBox.bottom - boundingBox.top));
      await this.client.callZome(this.appInfo.cell_data[0].cell_id, "cursors", "handle_cursor_moved", payload);
      this.wait = true;
      setTimeout(() => {
        this.wait = false;
      }, 1000/ this.timesPerSecond);
    }

  };

  async firstUpdated() {
    console.log('first updated start')
    this.appWebsocket = await AppWebsocket.connect(
      `ws://localhost:${process.env.HC_PORT}`,
      12000
    );

    this.appInfo = await this.appWebsocket.appInfo({
      installed_app_id: 'cursors',
    });
    this.client = new HolochainClient(this.appWebsocket);
    this.client.addSignalHandler(this.signalCb);
    console.log('client? ', this.client);
    this.loading = false;
  }

  render() {
    if (this.loading)
      return html`
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      `;

    return html`
      <div id="canvas" @mousemove=${(e:MouseEvent) => this.onMouseMove(e)}>
        <slot >
        </slot>
      </div>
    `;
  }

  static get scopedElements() {
    return {
      'mwc-circular-progress': CircularProgress
    };
  }
}
