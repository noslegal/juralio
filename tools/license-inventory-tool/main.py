import json
import os


def scan_package_json(path: str):
    package_json_path = os.path.join(path, "package.json")
    node_modules = os.path.join(path, "node_modules")
    with open(package_json_path, "r", encoding="utf8") as read_file:
        data = json.load(read_file)
        print('\n' +
              'Package'.ljust(35) + '\t' +
              'License Type'.ljust(15) + '\t' +
              'Version'.ljust(10) + '\t' +
              'Description')
        print(
            '-------'.ljust(35) + '\t' +
            '------------'.ljust(15) + '\t' +
            '-------'.ljust(10) + '\t' +
            '-----------')
        for package in data['dependencies'].keys():
            package_path = os.path.join(node_modules, package)
            with open(os.path.join(package_path, 'package.json'), "r", encoding="utf8") as package_json:
                package_data = json.load(package_json)
                license_type = package_data['license'] if 'license' in package_data else 'UNKNOWN'
                package_description = package_data.get('description','error')
                package_version = package_data['version']
                if package in commercial_packages:
                    license_type = 'Commercial'
                print(
                    package.ljust(35) + '\t' +
                    license_type.ljust(15) + '\t' +
                    package_version.ljust(10) + '\t' +
                    package_description[:80])


commercial_packages = []

print('\nFrontend NPM packages')
scan_package_json('../../frontend')

print('\nE2e NPM packages')
scan_package_json('../../e2e')

print('\nServer NPM packages')
scan_package_json('../../server')
