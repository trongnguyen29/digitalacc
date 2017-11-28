% %% user parameters
dataset = 2;
maindir = '~/Desktop/New Standardized Neuron/';
switch dataset
    case 1
        gfpdir = 'FLIM/Hour 16/CNGxPNC_2-5-14_E1H16_(z step_1.75um)/GFP Intensity/';
        intdir = 'FLIM/Hour 16/CNGxPNC_2-5-14_E1H16_(z step_1.75um)/Lifetime (Interaction)/';
        outputdir = 'CNGxPNC_2-5-14_E1H16';
    
        box = [200, 75, 500, 400]; %[x1 y1 x2 y2]
    case 2
        gfpdir = 'FLIM/Hour 16/CNGxWNC_12-27-13_E1H16 (z-step_1.50um)/GFP Intensity/';
        intdir = 'FLIM/Hour 16/CNGxWNC_12-27-13_E1H16 (z-step_1.50um)/Lifetime(Interaction)/';
        labeldir = '~/Desktop/accdigital/matlab/wild_type/low_res/time3/neuron_low1.mat';
        outputdir = 'CNGxWNC_12-27-13_E1H16';
        box = [100, 200, 600, 400]; %[x1 y1 x2 y2]
end

%% load image
V = loadimg( fullfile(maindir, gfpdir) );
if exist(outputdir, 'dir')
    prompt = 'Folder already exists. Overwrite? Y/N [Y]: ';
    str = input(prompt,'s');
    if isempty(str)
        str = 'Y';
    end
    if upper(str) == 'Y'
        rmdir(outputdir, 's');
    end
end

if ~exist(outputdir, 'dir')
    mkdir(outputdir);
end

% get intensity for volume rendering
for i = 1:size(V,3)
    imwrite(V(:,:,i), sprintf(fullfile(outputdir, 'z%03d.tif'), i) );
end
disp('Write file completed');

%% get Distance function for isosurface
% Vpad = padarray(V, [0 0 1], 0, 'both');
% D = double(bwdist(Vpad<=0) + (Vpad<=0) - min(bwdist(Vpad>0),1));
% D = max(D(:)) - D;
% D = D / max(D(:));
% D = uint8(D*255);
% 
% for i = 1:size(D,3)
%     imwrite(D(:,:,i), sprintf(fullfile(outputdir, 'z%03d.tif'), i) );
% end
% 
% %% get protein interaction
% Vppi = loadimg( fullfile(maindir, intdir), false );
% %%
% % clip value
% ppi_min = 1000;
% ppi_max = 5000;
% ppi = min(max(Vppi, ppi_min), ppi_max);
% ppi = (ppi - ppi_min) / (ppi_max - ppi_min);
% 
% figure, imshow3D(ppi);
% 
% if exist([outputdir '_ppi'], 'dir')
%     prompt = 'Folder already exists. Overwrite? Y/N [Y]: ';
%     str = input(prompt,'s');
%     if isempty(str)
%         str = 'Y';
%     end
%     if upper(str) == 'Y'
%         rmdir([outputdir '_ppi'], 's');
%     end
% end
% 
% if ~exist([outputdir '_ppi'], 'dir')
%     mkdir([outputdir '_ppi']);
% end
% 
% for i = 1:size(ppi,3)
%     imwrite(ppi(:,:,i), sprintf(fullfile([outputdir '_ppi'], 'z%03d.tif'), i) );
% end


% %%
% load(labeldir);
% 
% label = zeros(size(V), 'uint8');
% for i = 1:length(position_set)
%     boxpos = position_set{i};
%     tmp = zeros(size(Vs_set{i}{1}));
%     for j = 1:length(Vs_set{i})
%         tmp(Vs_set{i}{j}) = j;
%     end
%     label(boxpos(2):boxpos(4), boxpos(1):boxpos(3), :) = tmp;
% end
% figure, imshow3D(label);
% 
% if exist([outputdir '_label'], 'dir')
%     prompt = 'Folder already exists. Overwrite? Y/N [Y]: ';
%     str = input(prompt,'s');
%     if isempty(str)
%         str = 'Y';
%     end
%     if upper(str) == 'Y'
%         rmdir([outputdir '_label'], 's');
%     end
% end
% 
% if ~exist([outputdir '_label'], 'dir')
%     mkdir([outputdir '_label']);
% end
% 
% for i = 1:size(label,3)
%     imwrite(label(:,:,i), sprintf(fullfile([outputdir '_label'], 'z%03d.tif'), i) );
% end