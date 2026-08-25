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

  // 👁️ Variables pour la gestion du clignement des yeux
  private blinkTimer = 0;
  private isBlinking = false;
  private blinkDuration = 0;

  public getChatState() {
    return this.curState;
  }

  // Permet de recevoir les blendshapes du backend
  public updateBlendshapes(data: any) {
    this.liveBlendshapes = data;
  }

  // Permet de changer l'état, en transformant automatiquement "Listening" en "Idle"
  public setChatState(state: string) {
    // Si le main essaie de mettre "Listening", on force "Idle" en interne
    if (state === "Listening") {
      this.curState = "Idle";
    } else {
      // Réinitialise le chrono pile au moment de parler pour éviter le saut de la bouche
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
      // Visage neutre avec respiration par défaut (Idle)
      this.expressitionData = {
          jawOpen: 0.05,
          mouthClose: 0.50,
          headPitch: Math.sin(this.breathing) * 0.015,
          headYaw: Math.cos(this.breathing * 0.5) * 0.01
      };
    }
    
    // 2) Gestion de l'état Idle (et Listening intercepté qui devient Idle) + Clignement des yeux
    if (this.curState === "Idle") {
        this.expressitionData.headPitch = Math.sin(this.breathing) * 0.015;
        this.expressitionData.headYaw = Math.cos(this.breathing * 0.5) * 0.01;

        // Logique de clignement des yeux aléatoire
        this.blinkTimer += 1;
        
        // Toutes les ~3 à 5 secondes (environ 90 à 150 frames à ~30fps), on déclenche un clignement
        if (!this.isBlinking && this.blinkTimer > Math.floor(Math.random() * 60) + 90) {
            this.isBlinking = true;
            this.blinkDuration = 0;
            this.blinkTimer = 0;
        }

        if (this.isBlinking) {
            this.blinkDuration += 0.2; // Vitesse de fermeture/ouverture
            // Utilisation d'un sinus pour faire un aller-retour fluide des paupières (fermé puis ouvert)
            const blinkValue = Math.sin(this.blinkDuration);
            
            if (blinkValue > 0) {
                this.expressitionData.eyeBlinkLeft = blinkValue;
                this.expressitionData.eyeBlinkRight = blinkValue;
            } else {
                // Fin du clignement
                this.isBlinking = false;
            }
        }
    }

    // 3) Gestion de l'état Thinking
    if (this.curState === "Thinking") {
        this.expressitionData.browInnerUp = 0.25;
    }

    // 4) Animation bouche uniquement pendant Speaking (et sans flux backend)
    if (this.curState === "Speaking" && !this.liveBlendshapes) {
        const length = bsData["frames"].length;
        const frameInfoInternal = 1 / 25; 
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
