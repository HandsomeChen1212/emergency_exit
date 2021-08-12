import os
import random
trainval_percent = 0.2
train_percent = 0.8
xmlfilepath = 'VOCData/Annotations'
txtsavepath = 'VOCData/ImageSets'
total_xml = os.listdir(xmlfilepath)
num = len(total_xml)
list = range(num)
tv = int(num * trainval_percent)
tr = int(tv * train_percent)
trainval = random.sample(list, tv)
train = random.sample(trainval, tr)
ftrainval = open('VOCData/ImageSets/trainval.txt', 'w')
ftest = open('VOCData/ImageSets/test.txt', 'w')
ftrain = open('VOCData/ImageSets/train.txt', 'w')
fval = open('VOCData/ImageSets/val.txt', 'w')
for i in list:
    name = total_xml[i][:-4] + '\n'
    if i in trainval:
        ftrainval.write(name)
        if i in train:
            ftest.write(name)
        else:
            fval.write(name)
    else:
        ftrain.write(name)
ftrainval.close()
ftrain.close()
fval.close()
ftest.close()
