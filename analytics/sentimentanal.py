import math
import tkinter
import numpy as np
from matplotlib import pyplot as plt

f = open("sensorstream.txt", 'r')

y=[]
for i in range (200):
	y.append(random.randrange(-50,50))
