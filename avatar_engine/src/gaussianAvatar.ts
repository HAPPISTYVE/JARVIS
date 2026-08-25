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

  // Variables pour un clignement naturel (simple, sans double clignement)
  private blinkTimer = 0;
  private isBlinking = false;
  private blinkProgress = 0;
  private nextBlinkInterval = 150; 

  public getChatState() {
    return this.curState;
  }

  public updateBlendshapes(data: any) {
    this.liveBlendshapes = data;
  }

  public setChatState(state: string) {
    if (state === "Listening") {
      this.curState = "Idle";
    } else {
      if (state === "Speaking" && this.curState !== "Speaking") {
        this.startTime = performance.now() / 1000;
      }
      this.curState = state;
    }
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
      // Visage neutre de base
      this.expressitionData = {
          jawOpen: 0.05,
          mouthClose: 0.50,
          headPitch: Math.sin(this.breathing) * 0.015,
          headYaw: Math.cos(this.breathing * 0.5) * 0.01
      };
    }
    
    // 2) Gestion de l'état Idle : Respiration, Sourire subtil et Clignement des yeux
    if (this.curState === "Idle") {
        this.expressitionData.headPitch = Math.sin(this.breathing) * 0.015;
        this.expressitionData.headYaw = Math.cos(this.breathing * 0.5) * 0.01;

        // 😊 Léger sourire subtil et naturel (varie très légèrement avec la respiration pour être vivant)
        const subtleSmile = 0.15 + Math.sin(this.breathing * 0.5) * 0.03;
        this.expressitionData.mouthSmileLeft = subtleSmile;
        this.expressitionData.mouthSmileRight = subtleSmile;

        // Gestion du clignement des yeux (simple et espacé)
        this.blinkTimer += 1;
        if (!this.isBlinking && this.blinkTimer > this.nextBlinkInterval) {
            this.isBlinking = true;
            this.blinkProgress = 0;
            this.blinkTimer = 0;
            // Nouveau délai aléatoire entre 2.5 et 6 secondes
            this.nextBlinkInterval = Math.floor(Math.random() * 120) + 80;
        }

        if (this.isBlinking) {
            this.blinkProgress += 0.15; 
            const blinkValue = Math.sin(this.blinkProgress * Math.PI);
            
            if (this.blinkProgress <= 1) {
                this.expressitionData.eyeBlinkLeft = Math.max(0, blinkValue);
                this.expressitionData.eyeBlinkRight = Math.max(0, blinkValue);
            } else {
                this.isBlinking = false;
                this.expressitionData.eyeBlinkLeft = 0;
                this.expressitionData.eyeBlinkRight = 0;
            }
        }
    }

    // 3) Gestion de l'état Thinking
    if (this.curState === "Thinking") {
        this.expressitionData.browInnerUp = 0.25;
    }

    // 4) Animation bouche uniquement pendant Speaking
    if (this.curState === "Speaking" && !this.liveBlendshapes) {
        const length = bsData["frames"].length;
        const frameInfoInternal = 1 / 20; 
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
