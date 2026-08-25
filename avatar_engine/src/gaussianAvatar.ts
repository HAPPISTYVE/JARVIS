import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam";
import bsData from "../asset/test_expression_1s.json";

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";

  public curState = "Idle";

  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;

  // Temps utilisé pour l'animation
  private startTime = 0;

  // Animation légère de la tête
  private motionTime = 0;

  // Données reçues éventuellement du backend
  private liveBlendshapes: any = null;

  // Données d'expression courantes
  private expressitionData: any = {};

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

  // ============================================
  // DÉMARRAGE
  // ============================================

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
    this.motionTime = 0;

    // Démo automatique
    // Tu peux supprimer cette partie dans ton vrai projet.
    

  // ============================================
  // ÉTAT DU CHATBOT
  // ============================================

  public getChatState() {
    return this.curState;
  }

  public setChatState(state: string) {
    this.curState = state;

    // Quand la parole commence,
    // on recommence l'animation depuis le début.
    if (state === "Speaking" || state === "Responding") {
      this.startTime = performance.now() / 1000;
      this.motionTime = 0;
    }
  }

  // ============================================
  // BLENDSHAPES BACKEND
  // ============================================

  public updateBlendshapes(data: any) {
    if (!data) {
      this.liveBlendshapes = null;
      return;
    }

    this.liveBlendshapes = {
      ...data,
    };
  }

  // ============================================
  // EXPRESSIONS / ANIMATION
  // ============================================

  public getArkitFaceFrame() {
    this.motionTime += 0.05;

    /*
     * ------------------------------------------
     * 1. EXPRESSIONS DE BASE
     * ------------------------------------------
     */

    if (this.liveBlendshapes) {
      this.expressitionData = {
        ...this.liveBlendshapes,
      };
    } else {
      this.expressitionData = {};
    }

    /*
     * ------------------------------------------
     * 2. LISTENING
     * ------------------------------------------
     *
     * Petit mouvement naturel.
     */

    if (this.curState === "Listening") {
      this.expressitionData.jawOpen = 0.03;

      this.expressitionData.headPitch =
        Math.sin(this.motionTime) * 0.012;

      this.expressitionData.headYaw =
        Math.cos(this.motionTime * 0.5) * 0.008;
    }

    /*
     * ------------------------------------------
     * 3. THINKING
     * ------------------------------------------
     */

    if (this.curState === "Thinking") {
      this.expressitionData.browInnerUp = 0.20;

      this.expressitionData.headPitch =
        Math.sin(this.motionTime * 0.7) * 0.018;

      this.expressitionData.headYaw =
        Math.cos(this.motionTime * 0.5) * 0.012;
    }

    /*
     * ------------------------------------------
     * 4. SPEAKING / RESPONDING
     * ------------------------------------------
     *
     * On accepte les deux noms :
     *
     * Speaking   -> ton projet
     * Responding -> démo LAM
     */

    const isSpeaking =
      this.curState === "Speaking" ||
      this.curState === "Responding";

    if (isSpeaking) {
      this.applySpeakingAnimation();
    }

    /*
     * ------------------------------------------
     * 5. RETOUR
     * ------------------------------------------
     */

    return this.expressitionData;
  }

  // ============================================
  // ANIMATION DE PAROLE
  // ============================================

  private applySpeakingAnimation() {
    const length = bsData.frames.length;

    if (!length) {
      return;
    }

    // Le JSON de la démo est à 30 FPS
    const frameDuration = 1 / 30;

    const currentTime = performance.now() / 1000;

    const elapsed =
      currentTime - this.startTime;

    // Boucle sur les frames du JSON
    const animationDuration =
      length * frameDuration;

    const animationTime =
      elapsed % animationDuration;

    const frameIndex =
      Math.floor(animationTime / frameDuration);

    const frame =
      bsData.frames[frameIndex];

    if (!frame) {
      return;
    }

    /*
     * Application des blendshapes
     */

    bsData.names.forEach(
      (name: string, index: number) => {
        this.expressitionData[name] =
          frame.weights[index];
      }
    );

    /*
     * Petit mouvement naturel de la tête
     * pendant qu'il parle.
     */

    this.expressitionData.headPitch =
      (this.expressitionData.headPitch || 0) +
      Math.sin(this.motionTime * 1.3) * 0.008;

    this.expressitionData.headYaw =
      (this.expressitionData.headYaw || 0) +
      Math.cos(this.motionTime * 0.9) * 0.006;
  }
}
