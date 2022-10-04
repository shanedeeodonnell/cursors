import { LitElement, css, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import {
  AppWebsocket,
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

  @query("#icon")
  icon!: HTMLElement;

  private signalCb: AppSignalCb = async (signal: AppSignal) => {
    console.log("agent: ", signal.data.payload.agent);
    console.log("x: ", signal.data.payload.x);
    console.log("y: ", signal.data.payload.y);
    const x = signal.data.payload.x;
    const y = signal.data.payload.y;

    const boundingBox = this.cursorBox.getBoundingClientRect();
    this.icon.style.left = x * (boundingBox.right - boundingBox.left) + boundingBox.left  + 'px';
    this.icon.style.top = y * (boundingBox.bottom - boundingBox.top) + boundingBox.top  + 'px';
  };

  private onMouseMove = async (event: MouseEvent) => {
    const boundingBox = this.cursorBox.getBoundingClientRect();
    const x = (event.clientX - boundingBox.left) / (boundingBox.right - boundingBox.left);
    const y = (event.clientY - boundingBox.top) / (boundingBox.bottom - boundingBox.top);

    const payload = [x, y];
    if (!this.wait) {
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
        <img class="icon" id="icon" src="assets/cursor.png" width="24" height="24" />
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

  static styles = css`
    .icon {
      position:absolute;
      transform:translate(-50%,-50%);
      height:35px;
      width:35px;
      border-radius:50%;
      border:2px solid pink;
    }
  `;
}
