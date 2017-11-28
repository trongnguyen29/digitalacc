function V = loadimg( folder, normalized )
%LOADIMAGE load image into 3D array

if nargin < 2, normalized = true; end

filelist = dir([folder '*']);
cur = 1;
V = [];
for f = filelist'
    C = strsplit(f.name, '.');
    if f.name(1) == '.' || f.isdir || ~ismember(C{end}, {'tif', 'tiff'})
        continue
    end
    X = imread([folder f.name], C{end});
    % convert to grayscale
    if ndims(X) == 3
        X = rgb2gray(X);
    end
    X = single(X);
    
    %X = single(min(X,255));
    % normalize image
    if normalized
        X = X-min(X(:)); X = X/max(X(:)); X = uint8(round(X*255.0));
    end
    V(:,:,cur) = X;
    cur = cur + 1;
end
disp(['Number of images in the stack = ', num2str(size(V,3))]);

if isempty(V)
    warning(['ERROR: no image volume at ' folder])
end
end

