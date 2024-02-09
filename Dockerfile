FROM python:3.8
RUN mkdir /kronos_update
ADD update_worklog.py /kronos_update
WORKDIR /kronos_update
CMD ["python", "update_worklog.py"]