import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import * as geolib from 'geolib';
import {
  GoogleMaps, GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Marker,
  BaseArrayClass,
  Environment
} from '@ionic-native/google-maps/ngx';



@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  map: GoogleMap;

  // @ViewChild('map', { static: false }) mapElement: ElementRef;
  selectedCoords: any;
  location: {
    latitude: number,
    longitude: number
  };




  @Input() locationBack: any;

  // ngAfterViewInit() {
  //   this.getGoogleMaps().then(googleMaps => {
  //     const mapEl = this.mapElement.nativeElement;
  //     console.log(this.location);
  //     const map = new googleMaps.Map(mapEl, {
  //       center: {
  //         lat: this.location.latitude,
  //         lng: this.location.longitude
  //       },
  //       zoom: 15
  //     });

  //     googleMaps.event.addListenerOnce(map, 'idle', () => {
  //       this.renderer.addClass(mapEl, 'visible');
  //     });

  //     map.addListener('click', event => {
  //       this.selectedCoords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
  //     });

  //   }).catch(err => {
  //     console.log(err);
  //   });
  // }

  ngOnInit() {
    this.platform.ready();
    this.loadMap();
    // this.geolocation.getCurrentPosition().then(async (position) => {
    //   console.log(position);
    // });

    // this.map = GoogleMaps.create('map_canvas', {
    //   camera: {
    //     target: {
    //       position: { lat: 41.79883, lng: 140.75675 },
    //     }
    //   }
    // });
    // this.checkGPSPermission();
  }


  // ionViewDidLoad() {
  //   this.platform.ready().then(() => {
  //     console.log('ionViewDidLoad');
  //     this.loadMap()
  //   });
  //   // this.checkGPSPermission();
  // }

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2,
    public navCtrl: NavController,
    private geolocation: Geolocation,
    public toastCtrl: ToastController,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private platform: Platform
  ) { }


  valid() {
    this.modalCtrl.dismiss(this.selectedCoords).then(async () => {
      const toast = await this.toastCtrl.create({
        position: 'top',
        message: 'Cette position à été bien enregistrer !',
        duration: 3000
      });
      toast.present();
    });

  }


  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBMH2EIlWRZrmcVcTwHstzyQxWjSYAP4JQ';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google Map SDK not available.');
        }
      };
    }
    );
  }

  // Check if application having GPS access permission
  checkGPSPermission() {
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
      result => {
        if (result.hasPermission) {

          // If having permission show 'Turn On GPS' dialogue
          this.askToTurnOnGPS();
        } else {

          // If not having permission ask for permission
          this.requestGPSPermission();
        }
      },
      err => {
        alert(err);
      }
    );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        console.log('4');
      } else {
        // Show 'GPS Permission Request' dialogue
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            error => {
              // Show alert if user click on 'No Thanks'
              alert('requestPermission Error requesting location permissions ' + error);
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
      () => {
        // When GPS Turned ON call method to get Accurate location coordinates
        this.findUserLocation();
      },
      error => alert('Error requesting location permissions ' + JSON.stringify(error))
    );
  }

  findUserLocation() {
    const options = {
      enableHighAccuracy: true,
      timeout: 30000
    };

    this.geolocation.getCurrentPosition(options).then(async (position) => {
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      const toast = await this.toastCtrl.create({
        position: 'bottom',
        message: 'Taper sur l\'écran pour selectionner une position',
        duration: 5000
      });
      toast.present();

      console.log(this.location);
      console.log(
        'You are ',
        geolib.getDistance(
          { latitude: position.coords.latitude, longitude: position.coords.longitude },
          { latitude: 51.503333, longitude: -0.119722 },
        ),
        'meters away from 51.525, 7.4575'
      );

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  loadMap() {
    Environment.setEnv({
      // api key for server
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyBZamoub9SCWL2GriEBRSgLGVVrF0QPakk',

      // api key for local development
      'API_KEY_FOR_BROWSER_DEBUG': ''
    });
    this.map = GoogleMaps.create('map_canvas');
}

// onButtonClick() {
//   // Get the location of you
//   this.map.getMyLocation().then((location: MyLocation) => {
//     console.log(JSON.stringify(location, null ,2));

//     // Move the map camera to the location with animation
//     this.map.animateCamera({
//       target: location.latLng,
//       zoom: 17,
//       tilt: 30
//     });

//     // add a marker
//     let marker: Marker = this.map.addMarkerSync({
//       title: '@ionic-native/google-maps plugin!',
//       snippet: 'This plugin is awesome!',
//       position: location.latLng,
//       animation: GoogleMapsAnimation.BOUNCE
//     });

//     // show the infoWindow
//     marker.showInfoWindow();

//     // If clicked it, bounce it
//     marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
//       marker.setAnimation(GoogleMapsAnimation.BOUNCE);
//     });
//   });
// }
}




