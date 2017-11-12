import os
import math
import tkinter
import numpy as np
from matplotlib import pyplot as plt
import random

os.getcwd()
os.chdir("../userFiles")

files = os.listdir()

xData = []
yData = []
zData = []

for filename in files:
	f = open("../userFiles/"+filename, 'r')
	fileX = f.readline().split(',')
	fileY = f.readline().split(',')
	fileZ = f.readline().split(',')
	xData += fileX
	xData[-1] = xData[-1][:-1]
	yData += fileY
	yData[-1] = yData[-1][:-1]
	zData += fileZ
	zData[-1] = zData[-1][:-1]

xNums = []
yNums = []
zNums = []

for i in range(len(xData)):
	xNums.append(float(xData[i]))
	yNums.append(float(yData[i]))
	zNums.append(float(zData[i]))

f, axarr = plt.subplots(2,2)

axarr[0,0].plot(xNums)
axarr[0,0].set_ylim([-50,50])
axarr[0,1].plot(yNums)
axarr[0,1].set_ylim([-50,50])
axarr[1,0].plot(zNums)
axarr[1,0].set_ylim([-50,50])

xNums.sort()
yNums.sort()
zNums.sort()

iqrX = np.subtract(*np.percentile(xNums, [75,25]))
iqrY = np.subtract(*np.percentile(yNums, [75,25]))
iqrZ = np.subtract(*np.percentile(zNums, [75,25]))

lowThresh = 12
highThresh = 32

sentimentScore = iqrX+iqrY+iqrZ

print(sentimentScore)

if (sentimentScore < 12):
	sentimentScore = 12

if (sentimentScore > 32):
	sentimentScore = 32

scaledScore = (sentimentScore - lowThresh)/(highThresh-lowThresh)

print(scaledScore)

plt.show()

