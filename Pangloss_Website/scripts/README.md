Scripts for conversion from and to `ELAN` (`.eaf` format)
=============

`ELAN` is a piece of software that is widely used in linguistic fieldwork and in 'diversity linguistics' in general. 

Various scripts have been devised in order to achieve conversion from and to ELAN. The tool available from this folder was written by Laurent Delafontaine as part of a German-French project funded by DFG and ANR (DoReCo). (See also the scripts by Nathaniel Sims and Séverine Guillaume in a separate folder.)

The folder named `conversion_data\conversion` contains the files `fromPangloss.py`, `toPangloss.py` and `Transcription.py`, which perform the actual conversions. Example files are `crdo.xml`, an original file from the Pangloss Collection; its export to ELAN: `crdo.eaf`; and `crdo_test.xml` is an export back to Pangloss format, with added word-level time codes (generated through forced alignment, and manually verified by DoReCo project members).

These scripts come with no warranty. Work is continuing (as of late 2019 - early 2020) and there may exist newer versions. The reference version will be that available from the official repo/website of the DoReCo project.

