import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam";
import bsData from "../asset/test_expression_1s.json";

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";

  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;

  expressitionData: any = {};
  private liveBlendshapes: any = null;

  startTime = 0;
  private breathing = 0;
  private speakingTimer = 0;

  constructor(container: HTMLDivElement, assetsPath: string) {
    this._avatarDivEle = container;
    this._assetsPath = assetsPath;
    this._init();
  }

  private _init() {
    if (!this._avatarDivEle || !this._assetsPath) {
      throw new Error("Lack of necessary initialization parameters");
    }
  }

  public start() {
    this.render();
  }

  public async render() {
    this._renderer =
      await GaussianSplats3D.GaussianSplatRenderer.getInstance(
        this._avatarDivEle,
        this._assetsPath,
        {
          getChatState: this.getChatState.bind(this),
          getExpressionData: this.getArkitFaceFrame.bind(this),
          backgroundColor: "0x05070d",
          alpha: 1,
        }
      );

    this.startTime = performance.now() / 1000;
  }

  public getChatState() {
    return this.curState;
  }

  public updateBlendshapes(data: any) {
    this.liveBlendshapes = data;
  }

  public setChatState(state: string) {
    this.curState = state;

    // Recommence l'animation au début
    // quand l'avatar commence à parler.
    if (state === "Speaking" || state === "Responding") {
      this.startTime = performance.now() / 1000;
    }
  }

  public getArkitFaceFrame() {
    this.breathing += 0.05;
    this.speakingTimer += 0.4;

    // ==========================================
    // 1. EXPRESSIONS BACKEND
    // ==========================================

    if (this.liveBlendshapes) {
      this.expressitionData = {
        ...this.liveBlendshapes,
      };
    } else {
      this.expressitionData = {
        jawOpen: 0.05,
        mouthClose: 0.50,
        headPitch: Math.sin(this.breathing) * 0.015,
        headYaw: Math.cos(this.breathing * 0.5) * 0.01,
      };
    }

    // ==========================================
    // 2. LISTENING
    // ==========================================

    if (this.curState === "Listening") {
      this.expressitionData.headPitch =
        Math.sin(this.breathing) * 0.015;

      this.expressitionData.headYaw =
        Math.cos(this.breathing * 0.5) * 0.01;
    }

    // ==========================================
    // 3. THINKING
    // ==========================================

    if (this.curState === "Thinking") {
      this.expressitionData.browInnerUp = 0.25;

      this.expressitionData.headPitch =
        Math.sin(this.breathing * 0.7) * 0.015;

      this.expressitionData.headYaw =
        Math.cos(this.breathing * 0.5) * 0.01;
    }

    // ==========================================
    // 4. SPEAKING / RESPONDING
    // ==========================================

    const isSpeaking =
      this.curState === "Speaking" ||
      this.curState === "Responding";

    if (isSpeaking && !this.liveBlendshapes) {
      const length = bsData.frames.length;

      if (length > 0) {
        const frameDuration = 1 / 30;
        const currentTime = performance.now() / 1000;

        const elapsed = currentTime - this.startTime;

        const animationDuration =
          length * frameDuration;

        const animationTime =
          elapsed % animationDuration;

        const frameIndex =
          Math.floor(animationTime / frameDuration);

        const frame =
          bsData.frames[frameIndex];

        bsData.names.forEach(
          (name: string, index: number) => {
            this.expressitionData[name] =
              frame.weights[index];
          }
        );
      }

      // Petit mouvement de tête pendant la parole
      this.expressitionData.headPitch =
        (this.expressitionData.headPitch || 0) +
        Math.sin(this.breathing * 1.3) * 0.008;

      this.expressitionData.headYaw =
        (this.expressitionData.headYaw || 0) +
        Math.cos(this.breathing * 0.9) * 0.006;
    }

    return this.expressitionData;
  }
}
