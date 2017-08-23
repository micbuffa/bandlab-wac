#!/usr/bin/python

import os
import sys
import gzip
import xml.etree.ElementTree as ET
import json
import Tkinter as tk
from tkFileDialog import askopenfilename
from tkFileDialog import askdirectory



def mergeSampleJson (x,y):
	z = x.copy()
	z.update(y)
	return z


def metaFind(n):
    count = -1
    while count < n:
        count += 1
        print "sample", count + 1, "metaData:"
        sampleData = root.getchildren()[0].getchildren()[15].getchildren()[0].getchildren()[0].getchildren()[count]
        # fileName
        for child in sampleData.findall('Name'):
            fileName = child.attrib.get('Value')
            print "fileName:", fileName
        # midiNumber
        for child in sampleData.iter('RootKey'):
            midiNumber = int(child.attrib.get('Value'))
            print "midiNumber:", midiNumber
        # sample range
        samplerange = sampleData.getchildren()[4]
        for child in samplerange.findall('Min'):
            rangeMin = int(child.attrib.get('Value'))
            print "rangeMin:", rangeMin
        for child in samplerange.findall('Max'):
            rangeMax = int(child.attrib.get('Value'))
            if rangeMax == None:
                rangeMax = midiNumber
            if rangeMin == None:
                rangeMin = midiNumber
            #Adjusting range values to Null if rangeMin and rangeMax are equal. Best practice if no pitch shifting to to reference only the files root midi number.
            if rangeMax == rangeMin:
                rangeMin = midiNumber
                rangeMax = midiNumber
            if rangeMax >= midiNumber and rangeMin >= midiNumber:
                rangeMin = midiNumber
                rangeMax = midiNumber
            if rangeMax <= midiNumber and rangeMin <= midiNumber:
                rangeMin = midiNumber
                rangeMax = midiNumber


            print "rangeMax:", rangeMax
        # loop points and crossfade
        looping = sampleData.getchildren()[15]
        for child in looping.findall('Start'):
            loopStartSamples = child.attrib.get('Value')
            loopStart = float("{0:.6f}".format(int(loopStartSamples) / 44100.))
            print "loopStart:", loopStart
        for child in looping.findall('Crossfade'):
            crossfadeSamples = child.attrib.get('Value')
            crossfade = float("{0:.6f}".format(int(crossfadeSamples) / 44100.))
            print "crossFade:", crossfade
        for child in looping.findall('End'):
            if loopStart == 0.0 and crossfade == 0.0:
                loopEnd = None
                loopStart = None
                crossfade = None
            else:
                loopEndSamples = child.attrib.get('Value')
                loopEnd = float("{0:.6f}".format(int(loopEndSamples) / 44100.))
            print "loopEnd:", loopEnd

        sampleJson.append({
            "fileName": fileName,
            "midiNumber": midiNumber,
            "minRange": rangeMin,
            "maxRange": rangeMax,
            "loopStart": loopStart,
            "loopEnd": loopEnd,
            "crossfade": crossfade

        })
    # print "crossFadeArray:", sampleJson

    return count


def userSelect():
    global thisFile
    thisFile = ""
    thisFile = askopenfilename()
    if os.path.splitext(thisFile)[1] == ".adv":
        print thisFile
        return
    else:
        unsupportedFile = "\nERROR: Unsupported file type. Please select an .ADV file"
        errorConsole.insert(tk.END, unsupportedFile)
        thisFile = ""
        print thisFile
        return


def directorySelect():
    global thisOutput
    thisOutput = ""
    thisOutput = askdirectory()
    print thisOutput

def process():
    try:
        thisFile
    except NameError:
        selectInputError = "\nPlease select an .ADV file for parsing"
        errorConsole.insert(tk.END, selectInputError)
        return
    try:
        thisOutput
    except NameError:
        selectOutputError = "\nPlease select a directory for sample.json"
        errorConsole.insert(tk.END, selectOutputError)
        return
    print thisFile
    global categoryType
    categoryType = var.get()
    global instrumentSlug
    instrumentSlug = ins.get()
    print instrumentSlug
    print categoryType
    global releaseTime
    global name
    nameTest = nameInput.get()
    nameError = "\nERROR: Please insert a soundbank NAME!!!"
    if nameTest == "INPUT NAME":
        errorConsole.insert(tk.END, nameError)
        return
    else:
        name = nameTest
    releaseFloat = releaseInput.get()
    if releaseFloat == 'None':
        releaseTime = None
    else :
        releaseTime = float("{0:.3f}".format(float(releaseFloat)))
        if releaseTime > 1:
            errorConsole.insert(tk.END, rangeError)
            return
        if releaseTime < 0:
            errorConsole.insert(tk.END, rangeError)
            return
    rangeError = "\nERROR: Release time out of range 0-1"
    if categoryType == "kit" and releaseTime != None :
        releaseKitError = "\nA kit MUST have release time of None!!"
        errorConsole.insert(tk.END, releaseKitError)
        return

    if categoryType == "kit" :
        if instrumentSlug == "piano" or instrumentSlug == "synth-piano" or instrumentSlug == "bass" or instrumentSlug == "synth-bass" or instrumentSlug == "strings" or instrumentSlug == "wind":
            kitMustBeKitError = "\nERROR: A kit cannot be a pitched instrument!! Please select drum-kit or drum-pads"
            errorConsole.insert(tk.END, kitMustBeKitError)
            return
    if categoryType == "instrument":
        if instrumentSlug == "drum-kit" or instrumentSlug == "drum-pads":
            instrumentMustBeKitError = "\nERROR: An instrument cannot be a drum-kit or drum-pad!"
            errorConsole.insert(tk.END, instrumentMustBeKitError)
            return
    gzOpenFile = gzip.open(thisFile, 'rb')
    read_file = gzOpenFile.read()

    tree = ET.ElementTree(ET.fromstring(read_file))
    global root
    root = tree.getroot()

    print root

    global sampleJson
    sampleJson = []

    thisFileExtension = os.path.splitext(thisFile)[0]
    soundbankName = os.path.basename(thisFileExtension)
    release = releaseTime
    category = categoryType

    sampleparts = root.getchildren()[0].getchildren()[15].getchildren()[0].getchildren()[0]

    sampleCount = len(sampleparts.getchildren())
    print "Number of samples: ", sampleCount

    metaFind(sampleCount - 1)

    jsonHeader = {
        'slug': soundbankName,
        'name': name,
        'category': category,
        'release': release,
        'instrumentSlug': instrumentSlug,
        'samples': sampleJson

    }

    print jsonHeader

    defaultName = soundbankName
    jsonExtension = ".json"

    fileWrite = thisOutput + "/" + defaultName + jsonExtension
    print fileWrite

    with open(fileWrite, 'w') as outfile:
        json.dump(jsonHeader, outfile, indent=4, sort_keys=True, separators=(',', ':'))

    success = "\nSuccess!!"
    errorConsole.insert(tk.END, success)
    return


#tKinter win window
win = tk.Tk()

#basic GUI
win.geometry("%dx%d+%d+%d" % (275, 600, 200, 150))
win.title("BandLab Samples")
var = tk.StringVar(win)
ins = tk.StringVar(win)

var.set('instrument')
categoryChoices = ['instrument', 'kit']

ins.set('piano')
instrumentChoices = ['drum-kit', 'drum-pads', 'piano', 'synth-piano', 'bass', 'synth-bass', 'strings', 'wind']

global releaseSet
global soundbankNameDefault

releaseSet = 0.133
soundbankNameDefault = "INPUT NAME"

userInput = tk.StringVar(win)
userInput.set(releaseSet)

userInput2 = tk.StringVar(win)
userInput2.set(soundbankNameDefault)

selectButton = tk.Button(win, text="Select .ADV Sampler Preset", command=userSelect)
option = tk.OptionMenu(win, var, *categoryChoices)
option2 = tk.OptionMenu(win, ins, *instrumentChoices)
releaseInput = tk.Entry(win, textvariable=userInput)
nameInput = tk.Entry(win, textvariable=userInput2)
outputButton = tk.Button(win, text="Destination Directory", command=directorySelect)
processButton = tk.Button(win, text="Make .json!", command=process)
errorConsole = tk.Text(win, height=9, width=150)

selectButton.pack(padx=15, pady=15)
option.pack(padx=15, pady=15)
option2.pack(padx=15, pady=15)
releaseInput.pack(padx=15, pady=15)
nameInput.pack(padx=15, pady=15)
outputButton.pack(padx=15, pady=15)
processButton.pack(padx=15, pady=15)
errorConsole.pack(padx=15, pady=15)
logs = "Logs:\n"
errorConsole.insert(tk.END, logs)

#tKinter Loop
win.mainloop()



