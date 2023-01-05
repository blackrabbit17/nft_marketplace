from django.http import JsonResponse


def response_ok(payload):
    return JsonResponse({'status': 'OK', 'payload': payload})


def access_denied(message=None, error_code=403):

    resp = {'status': 'ERROR'}

    if message is not None:
        resp['message'] = message

    return JsonResponse(resp, status=error_code)


def method_not_allowed(error_code=405):

    return JsonResponse({'status': 'ERROR', 
                         'message': 'Method not allowed'}, 
                         status=error_code)


def obj_not_found(message):

    return JsonResponse({'status': 'ERROR', 
                         'message': message}, 
                         status=404)


def obj_found(serialized_object):

    return JsonResponse({'status': 'OK',
                         'payload': serialized_object})


def obj_deleted(message=None):
    return JsonResponse({'status': 'OK', 
                         'message': message})


def validation_error(message):
    return JsonResponse({'status': 'ERROR', 
                         'message': message}, 
                         status=422)
