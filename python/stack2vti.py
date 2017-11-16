#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Thu Nov 16 12:44:20 2017

@author: Sarun Gulyanon
"""
import os
import sys
import numpy as np
from skimage import io
import vtk

def writeVTI(V, filename): 
    dims = V.shape
    
    imageData = vtk.vtkImageData()
    imageData.SetDimensions(dims[1], dims[0], dims[2])
    if vtk.VTK_MAJOR_VERSION <= 5:
        imageData.SetNumberOfScalarComponents(1)
        if V.dtype.type == np.uint8:
            imageData.SetScalarTypeToUnsignedChar()
        elif V.dtype.type == np.double:
            imageData.SetScalarTypeToDouble()
        else:
            sys.stderr.write('Not support data type\n')
    else:
        if V.dtype.type == np.uint8:
            imageData.AllocateScalars(vtk.VTK_UNSIGNED_CHAR, 1)
        elif V.dtype.type == np.double:
            imageData.AllocateScalars(vtk.VTK_DOUBLE, 1)
        else:
            sys.stderr.write('Not support data type\n')
    
    # Fill every entry of the image data with V
    for z in range(dims[2]):
        for y in range(dims[1]):
            for x in range(dims[0]):
                imageData.SetScalarComponentFromDouble(y, x, z, 0, V[x,y,z])
     
    writer = vtk.vtkXMLImageDataWriter()
    writer.SetFileName(filename)
    if vtk.VTK_MAJOR_VERSION <= 5:
        writer.SetInputConnection(imageData.GetProducerPort())
    else:
        writer.SetInputData(imageData)
    writer.Write()


def rgb2gray(rgb):
    return np.dot(rgb[...,:3], [0.299, 0.587, 0.114])

def readVolume(directory):
    """ read image stack from a folder, an image per slice """
    # get image from folder, read only tif, tiff
    files = os.listdir(directory)
    imagefiles = ('.tif','.tiff')
    files = [f for f in files if np.any([f.endswith(x) for x in imagefiles])]    
    D = len(files)
    # get image size
    img = io.imread(os.path.join(directory, files[0]), as_grey=False)
    H = img.shape[0]
    W = img.shape[1]
    # read image, one slice at a time
    arr = np.empty((H,W,D), dtype='uint8')
    i = 0
    print 'Read From :', directory
    for f in files:
        print(f)
        img = io.imread(os.path.join(directory, f), as_grey=False)
        if img.ndim == 2:
            arr[:,:,i] = img
        elif img.ndim == 3:
            arr[:,:,i] = np.round(rgb2gray(img)).astype('uint8')
        i += 1
    return arr


if __name__ == "__main__":
    """ test stack2vti """
    import matplotlib.pyplot as plt
    # user parameters
    dataset = 1
    maindir = '~/Desktop/New Standardized Neuron/'
    if dataset == 1:
        gfpdir = 'FLIM/Hour 16/CNGxPNC_2-5-14_E1H16_(z step_1.75um)/GFP Intensity/'
        intdir = 'FLIM/Hour 16/CNGxPNC_2-5-14_E1H16_(z step_1.75um)/Lifetime (Interaction)/'
        filename = "CNGxPNC_2-5-14_E1H16.vti"
        # crop image volume
        box = np.array([200, 75, 500, 400]) #[x1 y1 x2 y2]
    elif dataset == 2:
        gfpdir = 'FLIM/Hour 16/CNGxWNC_12-27-13_E1H16 (z-step_1.50um)/GFP Intensity/'
        intdir = 'FLIM/Hour 16/CNGxPNC_2-5-14_E1H16_(z step_1.75um)/Lifetime (Interaction)/'
        filename = "CNGxWNC_12-27-13_E1H16.vti"
        # crop image volume
        box = np.array([100, 200, 600, 400]) #[x1 y1 x2 y2]
        
    # read volume
    V = readVolume( os.path.join(os.path.expanduser(maindir), gfpdir) )
#    Vppi = readVolume(maindir + intdir)
    if not 'box' in locals():
        box = np.array([0, 0, V.shape[1], V.shape[0]])

    
    # show first slice
    plt.imshow(V[:,:,0], cmap="gray")
    plt.plot(box[[0,2,2,0,0]], box[[1,1,3,3,1]], 'g')
    plt.show()
    plt.ion()
    plt.pause(0.5)
    
    # write to VTI file
    writeVTI(V[box[1]:box[3],box[0]:box[2]], filename)
    
    # Read the file (to test that it was written correctly)
    reader = vtk.vtkXMLImageDataReader()
    reader.SetFileName(filename)
    reader.Update()
     
    # Convert the image to a polydata
    imageDataGeometryFilter = vtk.vtkImageDataGeometryFilter()
    imageDataGeometryFilter.SetInputConnection(reader.GetOutputPort())
    imageDataGeometryFilter.Update()
     
    mapper = vtk.vtkPolyDataMapper()
    mapper.SetInputConnection(imageDataGeometryFilter.GetOutputPort())
     
    actor = vtk.vtkActor()
    actor.SetMapper(mapper)
    actor.GetProperty().SetPointSize(3)
     
    # create axes
    transform = vtk.vtkTransform()
    transform.Translate(1.0, 0.0, 0.0)
    transform.Scale(200.0, 200.0, 200.0)
    axes = vtk.vtkAxesActor()
    axes.SetUserTransform(transform)
    
    # Setup rendering
    renderer = vtk.vtkRenderer()
    renderer.AddActor(actor)
    renderer.AddActor(axes)
    renderer.SetBackground(1,1,1)
    renderer.ResetCamera()
     
    renderWindow = vtk.vtkRenderWindow()
    renderWindow.AddRenderer(renderer)
     
    renderWindowInteractor = vtk.vtkRenderWindowInteractor()
    renderWindowInteractor.SetRenderWindow(renderWindow)
    renderWindowInteractor.Initialize()
    renderWindowInteractor.Start()