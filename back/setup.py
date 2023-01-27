from setuptools import find_packages, setup

with open("requirements.txt") as f:
    REQUIREMENTS = f.readlines()

setup(
    name="boxtribute-server",
    description="""Boxtribute is a web application that makes it easy for
    organisations to source, store and distribute donated goods to people in
    need in a fair and dignified way.""",
    url="https://github.com/boxwise/boxtribute",
    author="Stichting Boxwise",
    author_email="hello@boxtribute.org",
    license="Apache 2.0",
    packages=find_packages(exclude=["test"]),
    package_data={"boxtribute_server": ["py.typed"]},
    install_requires=REQUIREMENTS,
)
