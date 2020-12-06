import cv2
import numpy as np
import sys
import signal
import subprocess
import time
import psutil
import RPi.GPIO as GPIO
from time import sleep

# Define pins
STEP_PIN = 25
DIRECTION_PIN = 19
#instantiate subprocess for running rgb matrix program from python
clockSubprocess = subprocess.Popen(['/home/aidan/rgbMatrix/rpi-rgb-led-matrix/examples-api-use/clock','--led-no-hardware-pulse','--led-slowdown-gpio=4','--led-gpio-mapping=adafruit-hat-pwm','--led-rows=32','--led-cols=64','--led-brightness=100', '-f','/home/aidan/rgbMatrix/rpi-rgb-led-matrix/fonts/8x13.bdf','-d','%I:%M:%S','-y','10','-C','255,255,255'])

class StepperHandler():

    __CLOCKWISE = 1
    __COUNTER_CLOCKWISE = 0

    def __init__(self, stepPin, directionPin, delay):

        # Configure instance
        self.CLOCKWISE = self.__CLOCKWISE
        self.COUNTER_CLOCKWISE = self.__COUNTER_CLOCKWISE
        self.StepPin = stepPin
        self.DirectionPin = directionPin
        self.Delay = delay
        self.CurrentDirection = self.CLOCKWISE

        # Setup gpio pins
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)
        GPIO.setup(self.StepPin, GPIO.OUT)
        GPIO.setup(self.DirectionPin, GPIO.OUT)

    def Step(self, stepsToTake, direction):
        if(direction):
            print("Taking " + str(stepsToTake) + " steps forward")
        else:
            print("Taking " + str(stepsToTake) + " steps backwards")
        # Set the direction
        GPIO.output(self.DirectionPin, direction)

        # Take requested number of steps
        for x in range(stepsToTake):
            #print("Step " + str(x))
            GPIO.output(self.StepPin, GPIO.HIGH)
            sleep(self.Delay)
            GPIO.output(self.StepPin, GPIO.LOW)
            sleep(self.Delay)
            
def exit_gracefully(signum, frame):
    # restore the original signal handler as otherwise evil things will happen
    # in raw_input when CTRL+C is pressed, and our signal handler is not re-entrant
    signal.signal(signal.SIGINT, original_sigint)
    print("\nQuitting\n\n")
    sys.exit(1)
    # restore the exit gracefully handler here    
    signal.signal(signal.SIGINT, exit_gracefully)

def init():
    #move linear actuator to very front and then backwards so we can set the correct starting position when clock turns on
    #initi is now done in clock calibration p5 sketch, just have to move backwards after tuning
    #stepperHandler.Step(5400,stepperHandler.CLOCKWISE)
    stepperHandler.Step(5000, stepperHandler.COUNTER_CLOCKWISE)
    
def end():
    subprocess.Popen(['sudo','python3','/home/aidan/blurClock/turnOffScreen.py',str(clockSubprocess.pid)])
    cap.release()
       
#trained modelsfor detecting face and open eyes
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades+"haarcascade_frontalface_default.xml")
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades+"haarcascade_eye_tree_eyeglasses.xml")
#get webcam
cap = cv2.VideoCapture(0)
#count how long it has been since we have seen eyes
lastEyeDetectionTime = 0
clockIsOn = False
# Create a new instance of our stepper class (note if you're just starting out with this you're probably better off using a delay of ~0.1)
stepperHandler = StepperHandler(STEP_PIN, DIRECTION_PIN, 0.0003)
#these two lines quite the program gracefully when keyboard interrupt
original_sigint = signal.getsignal(signal.SIGINT)
signal.signal(signal.SIGINT, exit_gracefully)
init()

while 1:
    #get video frame
    ret, img = cap.read()
    #uncomment to flip video 
    img = cv2.flip(img,0)
    #turn to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    #find faces
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    ###Face detection
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
        roi_gray = gray[y:y + h, x:x + w]
        roi_color = img[y:y + h, x:x + w]
        ##Eye Detection
        eyes = eye_cascade.detectMultiScale(roi_gray)
        for (ex, ey, ew, eh) in eyes:
            cv2.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (0, 255, 0), 2)
            if(clockIsOn==False):
                print ("Found eyes, move screen forward")
                stepperHandler.Step(5000,stepperHandler.CLOCKWISE)
            lastEyeDetectionTime = int(round(time.time()*1000))
            clockIsOn = True
    
    if(int(round(time.time()*1000)) - lastEyeDetectionTime > 500):
       if(clockIsOn):
           print ("it has been a second since eyes were last detected, move screen backwards")
           stepperHandler.Step(5000,stepperHandler.COUNTER_CLOCKWISE)
           clockIsOn = False
end()       





