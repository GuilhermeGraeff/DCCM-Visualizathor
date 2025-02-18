
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import GeneralLights from './sceneSubjects/GeneralLights';
import AxisMark from './sceneSubjects/AxisMark'
import DccmSlice from './sceneSubjects/DccmSlice'
import GroundPlane from './sceneSubjects/GroundPlane'
import TextTest from './sceneSubjects/TextTest'



function SceneManager() {
    const clock = new THREE.Clock();
    
    const screenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    
    const scene = buildScene();
    const renderer = buildRender(screenDimensions);
    const camera = buildCamera(screenDimensions);
    const controls = buildControls();
    const stats = createStats();
    const panel = createPanel();
    var sceneSubjects = createSceneSubjects(scene);
    var settings;

    
    function buildScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x959595);
        scene.backgroundBlurriness = 0

        return scene;
    }

    function buildRender({ width, height }) {
        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        return renderer;
    }

    function buildCamera({ width, height }) {
        const aspectRatio = width / height;
        const fieldOfView = 60;
        const nearPlane = 0.1;
        const farPlane = 1000; 
        const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = 2

        return camera;
    }

    function buildControls() {
        const controls = new OrbitControls(camera, renderer.domElement)
        return controls;
    }

    function createSceneSubjects(scene) {
        
        var sceneSubjects = [
            new GeneralLights(scene),
            new AxisMark(scene),
            new GroundPlane(scene),
            new DccmSlice(scene, settings['with ligand'], settings['modify negative threshold'], settings['modify positive threshold'], settings['selected slice'], settings['display unselected layers']),
        ];
        
        return sceneSubjects;
    }

    function createStats() {
        const stats = Stats()
        document.body.appendChild(stats.dom)

        return stats;
    }

    function createPanel() {
        const panel = new GUI( { width: 310 } );

        const folder1 = panel.addFolder( 'DCCM settings' );

        settings = {
            'with ligand': false,
            'modify positive threshold': 0.25,
            'modify negative threshold': 0.25,
            'selected slice': -1,
            'display unselected layers': true,
            'removeObjects': removeObjects,
            'recreateScene': recreateScene,
            'applyChanges': applyChanges,
        };
        
        folder1.add( settings, 'with ligand').onChange( applyChanges );
        folder1.add( settings, 'modify positive threshold', 0, 1, 0.05 ).onChange( applyChanges);
        folder1.add( settings, 'modify negative threshold', 0, 1, 0.05 ).onChange( applyChanges );
        folder1.add( settings, 'selected slice', -1, 18, 1 ).onChange( applyChanges );
        folder1.add( settings, 'display unselected layers' ).onChange( applyChanges );
        folder1.add( settings, 'removeObjects' );
        folder1.add( settings, 'recreateScene' );
        folder1.add( settings, 'applyChanges' );


        folder1.open();

        return panel
    }

    function select( condition ) {

        console.log('display unselected layers', condition)

    }


    function removeObjects() {
        console.log(sceneSubjects)
        sceneSubjects[3].disposePoints(scene,sceneSubjects[3].parentObject)
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        console.log(scene.children)
        renderer.render(scene, camera);
    }

    function recreateScene() {
        sceneSubjects = [
            new GeneralLights(scene),
            new AxisMark(scene),
            new GroundPlane(scene),
            new DccmSlice(scene, settings['with ligand'], settings['modify negative threshold'], settings['modify positive threshold'], settings['selected slice'], settings['display unselected layers']),
        ];
        renderer.render(scene, camera);
    }

    function applyChanges() {
        console.log(sceneSubjects)
        sceneSubjects[3].disposePoints(scene,sceneSubjects[3].parentObject)
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
        sceneSubjects = [
            new GeneralLights(scene),
            new AxisMark(scene),
            new GroundPlane(scene),
            new DccmSlice(scene, settings['with ligand'], settings['modify negative threshold'], settings['modify positive threshold'], settings['selected slice'], settings['display unselected layers']),
        ];
        renderer.render(scene, camera);
    }
    

    // Dccm management:









    this.update = function() {
        
        const elapsedTime = clock.getElapsedTime();

        for(let i=0; i<sceneSubjects.length; i++){
            if (Array.isArray(sceneSubjects[i])){
                for(let j=0; j<sceneSubjects[i].length; j++){
                    sceneSubjects[i][j].update(elapsedTime);
                }
            } else {
                sceneSubjects[i].update(elapsedTime);
            }
        }
        stats.begin()


        stats.end()

        renderer.render(scene, camera);

        stats.update()
    }

    this.onWindowResize = function() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    }
}

export default SceneManager