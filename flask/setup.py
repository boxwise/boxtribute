from setuptools import find_packages, setup

with open("requirements.txt") as f:
    REQUIREMENTS = f.readlines()

setup(
    name="boxtribute-server",
    description="""Boxwise is a web application that makes it easy for
    organisations to source, store and distribute donated goods to people in
    need in a fair and dignified way.""",
    url="https://github.com/boxwise/boxtribute",
    author="boxwise.co",
    author_email="hello@boxwise.co",
    license="Apache 2.0",
    packages=find_packages(exclude=["test"]),
    install_requires=REQUIREMENTS,
)
