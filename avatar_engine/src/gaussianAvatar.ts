import * as GaussianSplats3D from "gaussian-splat-renderer-for-lam";
import bsData from "../asset/test_expression_1s.json";

export class GaussianAvatar {
  private _avatarDivEle: HTMLDivElement;
  private _assetsPath = "";

  // ============================================
  // SEULEMENT 2 ÉTATS
  // ============================================

  public curState: "MOVING" | "SPEAKING" = "MOVING";

  private _renderer!: GaussianSplats3D.GaussianSplatRenderer;

  // ============================================
  // ANIMATION
  // ============================================

  private startTime = 0;
  private breathing = 0;

  // Expressions actuelles
  private expressionData: any = {};

  // Blendshapes envoyés éventuellement par le backend
  private liveBlendshapes: any = null;

  constructor(
    container: HTMLDivElement,
    assetsPath: string
  ) {
    this._avatarDivEle = container;
    this._assetsPath = assetsPath;

    this._init();
  }

  // ============================================
  // INITIALISATION
  // ============================================

  private _init() {
    if (!this._avatarDivEle || !this._assetsPath) {
      throw new Error(
        "Lack of necessary initialization parameters"
      );
    }
  }

  // ============================================
  // START
  // ============================================

  public start() {
    this.render();
  }

  // ============================================
  // RENDERER
  // ============================================

  public async render() {
    this._renderer =
      await GaussianSplats3D.GaussianSplatRenderer.getInstance(
        this._avatarDivEle,
        this._assetsPath,
        {
          getChatState:
            this.getChatState.bind(this),

          getExpressionData:
            this.getArkitFaceFrame.bind(this),

          backgroundColor: "0x05070d",

          alpha: 1,
        }
      );

    this.startTime =
      performance.now() / 1000;
  }

  // ============================================
  // ÉTAT
  // ============================================

  public getChatState() {
    return this.curState;
  }

  // ============================================
  // CHANGER L'ÉTAT
  // ============================================

  public setChatState(
    state: "MOVING" | "SPEAKING"
  ) {
    this.curState = state;

    // Quand il commence à parler,
    // on recommence l'animation du JSON
    // depuis la première frame.
    if (state === "SPEAKING") {
      this.startTime =
        performance.now() / 1000;
    }
  }

  // ============================================
  // BLENDSHAPES DU BACKEND
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
  // ANIMATION DU VISAGE
  // ============================================

  public getArkitFaceFrame() {
    // Petit compteur pour les mouvements naturels
    this.breathing += 0.05;

    // ==========================================
    // ÉTAT 1 : MOVING
    // ==========================================

    if (this.curState === "Listening") {

      // Si on reçoit des blendshapes du backend,
      // on les utilise.
      if (this.liveBlendshapes) {
        this.expressionData = {
          ...this.liveBlendshapes,
        };
      } else {

        // Visage naturel
        this.expressionData = {
          jawOpen: 0.03,

          mouthClose: 0.5,

          // Petit mouvement de tête
          headPitch:
            Math.sin(this.breathing) * 0.015,

          headYaw:
            Math.cos(
              this.breathing * 0.5
            ) * 0.01,
        };
      }

      return this.expressionData;
    }

    // ==========================================
    // ÉTAT 2 : SPEAKING
    // ==========================================

    if (this.curState === "Speaking") {

      /*
       * Si le backend envoie de vraies
       * expressions, on les utilise.
       */
      if (this.liveBlendshapes) {

        this.expressionData = {
          ...this.liveBlendshapes,
        };

      } else {

        /*
         * Sinon on utilise l'animation
         * fournie par la démo LAM.
         */

        const frames =
          bsData.frames;

        const names =
          bsData.names;

        const length =
          frames.length;

        if (length > 0) {

          // Le JSON est à 30 FPS
          const frameDuration =
            1 / 30;

          const currentTime =
            performance.now() / 1000;

          const elapsed =
            currentTime -
            this.startTime;

          // Durée totale de l'animation
          const animationDuration =
            length *
            frameDuration;

          // Boucle sur l'animation
          const animationTime =
            elapsed %
            animationDuration;

          // Frame actuelle
          const frameIndex =
            Math.floor(
              animationTime /
                frameDuration
            );

          const frame =
            frames[frameIndex];

          // Appliquer tous les blendshapes
          names.forEach(
            (
              name: string,
              index: number
            ) => {

              this.expressionData[name] =
                frame.weights[index];
            }
          );
        }
      }

      // ========================================
      // PETIT MOUVEMENT DE TÊTE PENDANT PAROLE
      // ========================================

      this.expressionData.headPitch =
        (this.expressionData.headPitch || 0) +
        Math.sin(
          this.breathing * 1.2
        ) * 0.008;

      this.expressionData.headYaw =
        (this.expressionData.headYaw || 0) +
        Math.cos(
          this.breathing * 0.8
        ) * 0.006;

      return this.expressionData;
    }

    // Sécurité
    return this.expressionData;
  }
}
