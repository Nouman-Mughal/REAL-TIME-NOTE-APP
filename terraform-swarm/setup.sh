
# scp $AWS_KEY_PAIR ubuntu@${NOTES_PUBLIC_IP}:
# ssh -i $AWS_KEY_PAIR ubuntu@${NOTES_PUBLIC_IP} swarm-setup.sh `basename ${AWS_KEY_PAIR}`

# docker context update --docker host=ssh://ubuntu@${NOTES_PUBLIC_IP} ec2
# docker context use ec2
# printf $GOOGLE_CONSUMER_KEY    | docker secret create GOOGLE_CONSUMER_KEY -
# printf $GOOGLE_CONSUMER_SECRET | docker secret create GOOGLE_CONSUMER_SECRET -

# sh ../ecr/login.sh

# (
#     cd ../compose-swarm
#     docker stack deploy --with-registry-auth  --compose-file docker-compose.yml notes
# )

# one can automate the process but I would like to go with manual handling.