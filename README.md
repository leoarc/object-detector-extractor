# Object Detector-Extractor

## caMicroscope Code Challenge for Region Of Interest Extraction

Hosted app : https://obj-det-ext.herokuapp.com/

Sample Data for testing :  [Google Drive Link](https://drive.google.com/open?id=1KHQNxEshEsBMv0JRlQtX2jC6lyvPwQAe)

### Steps to use  :
1) Click on ``` Detect objects in images ```
2) Upload multiple images (few samples are given in the link above ; can use any images)
3) Click on ``` Detect Objects ``` button
4) Once the detection is complete a list of found objects will appear 
5) Select one object from the list and click ``` Draw ``` . 
6) You can download the cropped images by clicking the ``` Download Cropped Images ``` button.
7) You can select a different class of object and click ``` Draw ``` to detect different objects and downloading them correspondingly.
8) Click on ``` Browse ``` if  you want to upload a new set of images.


### Steps to run locally :

#### Requirements :
``` nodejs ``` , ``` express ```

STEPS :

1) Clone the repo 
2) ``` cd local-server ```
3) ``` nodejs server.js ```
4) Go to http://localhost:3000/detect.html
