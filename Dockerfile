FROM python:3.8
LABEL org.opencontainers.image.source=https://github.com/srajasimman/kronos-worklog-update \
      org.opencontainers.image.authors=srajasimman \
      org.opencontainers.image.title=kronos-worklog-update \
      org.opencontainers.image.description="Docker image for kronos-worklog-update" \
      org.opencontainers.image.licenses=MIT
RUN mkdir /kronos_update
ADD update_worklog.py /kronos_update
WORKDIR /kronos_update
CMD ["python", "update_worklog.py"]