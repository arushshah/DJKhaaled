import random
import tkinter
import numpy as np
from matplotlib import pyplot as plt
y=[]
for i in range (200):
	y.append(random.randrange(-50,50))

z=[]
for i in range (200):
	z.append(random.randrange(-5,5))

plt.figure(1)

plt.subplot(211)
s = plt.subplot(211)
s.set_ylim([-50,50])
plt.plot(y)

plt.subplot(212)
t = plt.subplot(212)
t.set_ylim([-50,50])
plt.plot(z)

plt.show()

