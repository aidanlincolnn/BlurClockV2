import sys
import RPi.GPIO as GPIO
from time import sleep

direction = bool(sys.argv[1])

class StepperHandler():

    __CLOCKWISE = 1
    __ANTI_CLOCKWISE = 0

    def __init__(self, stepPin, directionPin, delay):

        # Configure instance
        self.CLOCKWISE = self.__CLOCKWISE
        self.ANTI_CLOCKWISE = self.__ANTI_CLOCKWISE
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

        print("Step Pin: " + str(self.StepPin) + " Direction Pin: " + str(self.DirectionPin) + " Delay: " + str(self.Delay))
        print("Taking " + str(stepsToTake) + " steps.")
        # Set the direction
        GPIO.output(self.DirectionPin, direction)

        # Take requested number of steps
        for x in range(stepsToTake):
            #print("Step " + str(x))
            GPIO.output(self.StepPin, GPIO.HIGH)
            sleep(self.Delay)
            GPIO.output(self.StepPin, GPIO.LOW)
            sleep(self.Delay)

# Define pins
STEP_PIN = 25
DIRECTION_PIN = 19

# Create a new instance of our stepper class (note if you're just starting out with this you're probably better off using a delay of ~0.1)
stepperHandler = StepperHandler(STEP_PIN, DIRECTION_PIN, 0.0003)

# go 10 steps in direction that was input into program
stepperHandler.Step(10,direction)
