import { Component, OnInit, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as THREE from "three";
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef: ElementRef;

  //? Helper Properties (Private Properties);
  //? Helper Properties (Private Properties);

  //* Cube Properties

  @Input() public rotationSpeedX: number = 0.05;

  @Input() public rotationSpeedY: number = 0.01;

  @Input() public size: number = 200;

  @Input() public texture: string = "/assets/texture.jpg";


  //* Stage Properties

  @Input() public cameraZ: number = 400;

  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPane: number = 1;

  @Input('farClipping') public farClippingPane: number = 1000;

  //? Scene properties
  private camera: THREE.PerspectiveCamera;

  private controls: OrbitControls;

  private ambientLight: THREE.AmbientLight;

  private light1: THREE.PointLight;

  private light2: THREE.PointLight;

  private light3: THREE.PointLight;

  private light4: THREE.PointLight;

  private model: THREE.Group;

  private directionalLight: THREE.DirectionalLight;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private loaderGLTF = new GLTFLoader();

  private renderer: THREE.WebGLRenderer;

  private scene: THREE.Scene;

  private numberTexture: THREE.CanvasTexture;
  private spriteMaterial: THREE.SpriteMaterial;

  private sprite: THREE.Sprite;

  private spriteBehindObject: any;

  private annotation: HTMLDivElement;


  private createControls = () => {
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    document.body.appendChild(labelRenderer.domElement);
    this.controls = new OrbitControls(this.camera, labelRenderer.domElement);
    this.controls.autoRotate = true;
    this.controls.enableZoom = true;
    this.controls.enablePan = false;
    this.controls.update();
  };

  /**
   * Create the scene
   *
   * @private
   * @memberof CubeComponent
   */
  private createScene() {
    //* Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdddddd)
    this.loaderGLTF.load('assets/epson.glb', (gltf: GLTF) => {
      this.model = gltf.scene;
      var box = new THREE.Box3().setFromObject(this.model);
      box.getCenter(this.model.position); // this re-sets the mesh position
      this.model.position.multiplyScalar(-1);
      this.scene.add(this.model);
    });
    //*Camera
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    )
    this.camera.position.x = 100;
    this.camera.position.y = 100;
    this.camera.position.z = 100;
    this.ambientLight = new THREE.AmbientLight(0x101010, 100);
    this.scene.add(this.ambientLight);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.directionalLight.position.set(0, 1, 0);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
    this.light1 = new THREE.PointLight(0x101010, 1);
    this.light1.position.set(0, 300, 500);
    this.scene.add(this.light1);
    this.light2 = new THREE.PointLight(0x101010, 1);
    this.light2.position.set(500, 100, 0);
    this.scene.add(this.light2);
    this.light3 = new THREE.PointLight(0x101010, 1);
    this.light3.position.set(0, 100, -500);
    this.scene.add(this.light3);
    this.light4 = new THREE.PointLight(0x101010, 1);
    this.light4.position.set(-500, 300, 500);
    this.scene.add(this.light4);
    this.numberTexture = new THREE.CanvasTexture(this.canvas);
    this.spriteMaterial = new THREE.SpriteMaterial({
      map: this.numberTexture,
      alphaTest: 0.5,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    this.sprite = new THREE.Sprite(this.spriteMaterial);
    this.sprite.position.set(550, 550, 550);
    this.sprite.scale.set(60, 60, 1);
    var box = new THREE.Box3().setFromObject(this.sprite);
    box.getCenter(this.sprite.position); // this re-sets the mesh position
    this.sprite.position.multiplyScalar(-1);
    this.scene.add(this.sprite);
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  /**
 * Start the rendering loop
 *
 * @private
 * @memberof CubeComponent
 */
  private startRenderingLoop() {
    //* Renderer
    // Use canvas element in template
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    let component: ModelComponent = this;
    (function render() {
      component.renderer.render(component.scene, component.camera);
      requestAnimationFrame(render);
    }());
  }

  updateAnnotationOpacity() {
    const meshDistance = this.camera.position.distanceTo(this.model.position);
    const spriteDistance = this.camera.position.distanceTo(this.sprite.position);
    this.spriteBehindObject = spriteDistance > meshDistance;
    this.sprite.material.opacity = this.spriteBehindObject ? 0.25 : 1;

    // Do you want a number that changes size according to its position?
    // Comment out the following line and the `::before` pseudo-element.
    this.sprite.material.opacity = 0;
  }

  updateScreenPosition() {
    const vector = new THREE.Vector3(250, 250, 250);

    vector.project(this.camera);

    vector.x = Math.round((0.5 + vector.x / 2) * (this.canvas.width / window.devicePixelRatio));
    vector.y = Math.round((0.5 - vector.y / 2) * (this.canvas.height / window.devicePixelRatio));

    this.annotation.style.top = `${vector.y}px`;
    this.annotation.style.left = `${vector.x}px`;
    this.annotation.style.opacity = this.spriteBehindObject ? "0.25" : "1";
    const earthLabel = new CSS2DObject(this.annotation);
    earthLabel.position.set(100, 100, 0);
    this.model.add(earthLabel);
  }

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.annotation = <HTMLDivElement>document.querySelector(".annotation");
    this.createScene();
    this.startRenderingLoop();
    this.createControls();
    setTimeout(() => {
      this.updateAnnotationOpacity();
      this.updateScreenPosition();
    }, 100);
  }


}
