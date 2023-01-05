from django.http import HttpResponse
import os


def find_asset(root_paths, uuid):

    extensions = ['.png', '.jpg', '.gif']

    for dir_c in root_paths:

        for ext in extensions:

            full_path = str(dir_c) + '/' + str(uuid) + ext 

            if os.path.exists(full_path):
                image_data = open(full_path, "rb").read()

                if str(full_path).endswith('.png'):
                    return HttpResponse(image_data, content_type="image/png")
                elif str(full_path).endswith('.jpg'):
                    return HttpResponse(image_data, content_type="image/jpg")
                elif str(full_path).endswith('.gif'):
                    return HttpResponse(image_data, content_type="image/gif")
                else:
                    raise ValueError('Unknown file type')

    raise FileNotFoundError()
