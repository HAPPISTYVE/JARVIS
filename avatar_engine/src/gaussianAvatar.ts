import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam"
import bsData from "../asset/test_expression_1s.json"

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";
  public curState = "Idle";
  private _renderer: GaussianSplats3D.GaussianSplatRenderer;

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
    this._renderer = await GaussianSplats3D.GaussianSplatRenderer.getInstance(
      this._avatarDivEle,
      this._assetsPath,
      {
        getChatState: this.getChatState.bind(this),
        getExpressionData: this.getArkitFaceFrame.bind(this),
        backgroundColor: "0x05070d",
        alpha: 1
      },
    );

    this.startTime = performance.now() / 1000;
  }

  expressitionData: any;
  private liveBlendshapes: any = null;
  startTime = 0;
  private breathing = 0;
  private speakingTimer = 0;

  public getChatState() {
    return this.curState;
  }

  public updateBlendshapes(data: any) {
    this.liveBlendshapes = data;
  }

  public setChatState(state: string) {
    this.curState = state;
    if (state !== "Speaking") {
      this.liveBlendshapes = null;
    }
  }

  public getArkitFaceFrame() {
    const currentTime = performance.now() / 1000;
    this.breathing += 0.05;
    this.speakingTimer += 0.4;

    // 1) Base universelle (utilisée au démarrage, en Idle, et en Listening)
    // Cela garantit que le mouvement de respiration/tête est le même partout hors "Speaking"
    this.expressitionData = {
        jawOpen: 0.05,
        mouthClose: 0.50,
        headPitch: Math.sin(this.breathing) * 0.015,
        headYaw: Math.cos(this.breathing * 0.5) * 0.01
    };

    // 2) Si on reçoit du live et qu'on est en train de parler
    if (this.liveBlendshapes && this.curState === "Speaking") {
        this.expressitionData = {
            ...this.expressitionData,
            ...this.liveBlendshapes
        };
    } 
    // 3) Animation de la bouche via le JSON si Speaking et pas de flux live
    else if (this.curState === "Speaking" && !this.liveBlendshapes) {
        const length = bsData["frames"].length;
        const frameInfoInternal = 1 / 30;
        
        const calcDelta = (currentTime - this.startTime) % (length * frameInfoInternal);
        const frameIndex = Math.floor(calcDelta / frameInfoInternal);

        bsData["names"].forEach((name: string, index: number) => {
            this.expressitionData[name] = bsData["frames"][frameIndex]["weights"][index];
        });
    }

    

    // Note : Pour "Listening", il utilise désormais directement la base (1) 
    // exactement comme au démarrage, donc il continue de bouger de la même manière fluide.

    return this.expressitionData;
  }
}
