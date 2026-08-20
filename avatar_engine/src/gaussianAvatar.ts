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
  }

  public getArkitFaceFrame() {
    this.breathing += 0.05;
    this.speakingTimer += 0.4;

    // 1) Si le backend envoie de vrais blendshapes
    if (this.liveBlendshapes) {
        this.expressitionData = {
            ...this.liveBlendshapes
        };
    } 
    else {
    // Visage neutre avec bouche légèrement ouverte
    this.expressitionData = {
        jawOpen: 0.05,
        mouthClose: 0.50,
        headPitch: Math.sin(this.breathing) * 0.015,
        headYaw: Math.cos(this.breathing * 0.5) * 0.01
    };
}
    

    
        // 2) Etats du chatbot
    if (this.curState === "Listening") {
        this.expressitionData.headPitch = Math.sin(this.breathing) * 0.02;
        this.expressitionData.headYaw = Math.cos(this.breathing * 0.5) * 0.015; // <--- Ajoute cette ligne
    }


    if (this.curState === "Thinking") {
        this.expressitionData.browInnerUp = 0.25;
    }

    // 3) Animation bouche uniquement pendant Speaking (et sans flux backend)
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

    // Un seul et unique retour à la fin de la fonction
    return this.expressitionData;
  }
}
