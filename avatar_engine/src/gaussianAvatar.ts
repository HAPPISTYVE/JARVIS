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

  // Permet de recevoir les blendshapes du backend
  public updateBlendshapes(data: any) {
    this.liveBlendshapes = data;
  }

  // Permet aussi de changer l'état du chatbot
  public setChatState(state: string) {
    this.curState = state;
    
    // SÉCURITÉ : Si on passe en mode Listening ou autre, 
    // on efface le flux live figé pour redonner la main aux animations de base
    if (state !== "Speaking") {
      this.liveBlendshapes = null;
    }
  }

  public getArkitFaceFrame() {
    this.breathing += 0.05;
    this.speakingTimer += 0.4;

    // 1) Si on a un flux live valide (uniquement en mode Speaking avec données reçues)
    if (this.liveBlendshapes && this.curState === "Speaking") {
        this.expressitionData = {
            ...this.liveBlendshapes
        };
    } 
    // 2) Sinon, visage neutre avec respiration par défaut
    else {
        this.expressitionData = {
            jawOpen: 0.05,
            mouthClose: 0.50,
            headPitch: Math.sin(this.breathing) * 0.015,
            headYaw: Math.cos(this.breathing * 0.5) * 0.01
        };
    }

    // 3) Ajustements selon les états du chatbot
    if (this.curState === "Listening") {
        this.expressitionData.headPitch = Math.sin(this.breathing) * 0.02;
    }

    if (this.curState === "Thinking") {
        this.expressitionData.browInnerUp = 0.25;
    }

    // 4) Animation de la bouche via le JSON si Speaking et pas de flux live
    if (this.curState === "Speaking" && !this.liveBlendshapes) {
        const length = bsData["frames"].length;
        const frameInfoInternal = 1 / 30;
        const currentTime = performance.now() / 1000;
        
        const calcDelta = (currentTime - this.startTime) % (length * frameInfoInternal);
        const frameIndex = Math.floor(calcDelta / frameInfoInternal);

        bsData["names"].forEach((name: string, index: number) => {
            this.expressitionData[name] = bsData["frames"][frameIndex]["weights"][index];
        });
    }

    return this.expressitionData;
  }
}
